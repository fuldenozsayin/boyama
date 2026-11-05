#!/usr/bin/env python3
"""
One-time iOS signing setup on EAS, run on CI with the App Store Connect API key
(EXPO_ASC_* environment variables): no Apple ID password, no 2FA code.

Why: `eas build --non-interactive` uses stored credentials but never creates the
first Apple Distribution Certificate. eas-cli only does that interactively, so
this script runs `eas credentials:configure-build` in a pseudo-terminal and
answers ONLY the questions below, always with the safe choice:

  "Reuse this distribution certificate?"           -> yes. Distribution
      certificates are not app-specific; reusing one changes nothing for any
      other app on the team.
  "Generate a new Apple Distribution Certificate?" -> yes
  "Generate a new Apple Provisioning Profile?"     -> yes (for this app's
      bundle ID only)
  "Would you like to reuse the original profile?"  -> yes

Any other question stops the run. In particular, when Apple's certificate limit
is reached the run stops BEFORE eas-cli can ask which certificates to revoke:
no certificate is ever revoked. When the credentials already exist, the command
asks nothing and this step just confirms them.

Usage: eas-ios-credentials.py [command ...]
(default command: npx eas-cli@<pinned> credentials:configure-build -p ios -e production)
"""
import os
import re
import sys
import time

import pexpect

EAS_CLI = os.environ.get("EAS_CLI_CREDENTIALS", "eas-cli@27.4.1")
DEFAULT_CMD = ["npx", "--yes", EAS_CLI, "credentials:configure-build", "--platform", "ios", "--profile", "production"]

# (question text as rendered by the `prompts` library, key to send)
SAFE_ANSWERS = [
    ("Reuse this distribution certificate?", "y"),
    ("Generate a new Apple Distribution Certificate?", "y"),
    ("Generate a new Apple Provisioning Profile?", "y"),
    ("Would you like to reuse the original profile?", "y"),
]
# text that must never be answered: stop immediately
STOP = [
    re.compile(r"Maximum number of Distribution Certificates", re.I),
    re.compile(r"Select certificates to revoke", re.I),
    re.compile(r"\brevoke\b", re.I),
]
# an open question from `prompts`: "? <message> ›"
OPEN_QUESTION = re.compile(r"(?ms)^\s*\? (.{1,600}?) ›")  # a message may span lines
DONE = "All credentials are ready to build"
ANSI = re.compile(r"\x1b\[[0-9;?]*[A-Za-z]|\x1b[()][A-Za-z0-9]|\x1b[=>78]|\r")
TOTAL_TIMEOUT = 20 * 60


def fail(child, msg, code=2):
    print(f"\n::error::{msg}", flush=True)
    try:
        child.terminate(force=True)
    except Exception:
        pass
    sys.exit(code)


def main():
    cmd = sys.argv[1:] or DEFAULT_CMD
    env = dict(os.environ, NO_COLOR="1", FORCE_COLOR="0")
    child = pexpect.spawn(cmd[0], cmd[1:], env=env, encoding="utf-8", codec_errors="replace", dimensions=(60, 220), timeout=None)
    seen = ""  # everything printed so far (ANSI removed)
    pos = 0  # start of the part of `seen` not consumed by an answered question
    waiting_done = None  # after answering: wait for "✔ <question>" before answering anything else
    answered = []
    start = time.time()
    while True:
        try:
            chunk = child.read_nonblocking(4096, timeout=2)
        except pexpect.TIMEOUT:
            chunk = ""
        except pexpect.EOF:
            break
        if chunk:
            sys.stdout.write(chunk)
            sys.stdout.flush()
            seen += ANSI.sub("", chunk)
        rest = seen[pos:]

        for pat in STOP:
            if pat.search(rest):
                fail(
                    child,
                    "Apple hesabındaki dağıtım sertifikası sınırına ulaşıldı. Hiçbir sertifika iptal EDİLMEDİ. "
                    "Ne yapılacağına birlikte karar verelim (docs/IOS_TESTFLIGHT.md, 'Olası hata').",
                    3,
                )

        if waiting_done is not None:
            done_at = rest.find("✔ " + waiting_done)
            if done_at < 0:
                done_at = rest.find("√ " + waiting_done)
            if done_at >= 0:
                pos += done_at + len(waiting_done) + 2
                waiting_done = None
            elif time.time() - start > TOTAL_TIMEOUT:
                fail(child, f"Answer to '{waiting_done}' was not acknowledged.")
            continue

        q = OPEN_QUESTION.search(rest)
        if q:
            text = q.group(1).strip()
            for question, key in SAFE_ANSWERS:
                if text.startswith(question):
                    print(f"\n[ci] answering '{question}' -> {key}", flush=True)
                    child.send(key)
                    answered.append(question)
                    waiting_done = question
                    pos += q.start()
                    break
            else:
                fail(child, f"Beklenmeyen soru, güvenlik için durduruldu: {text!r}")
            continue

        if time.time() - start > TOTAL_TIMEOUT:
            fail(child, "iOS credentials setup timed out.")

    child.close()
    code = child.exitstatus if child.exitstatus is not None else 1
    if code != 0:
        print(f"\n::error::eas credentials:configure-build exited with {code}", flush=True)
        sys.exit(code)
    if DONE not in seen:
        print(f"\n::error::'{DONE}' was not printed", flush=True)
        sys.exit(1)
    print(f"\n[ci] iOS credentials ready. Answered: {answered or 'nothing (already set up)'}", flush=True)


if __name__ == "__main__":
    main()
