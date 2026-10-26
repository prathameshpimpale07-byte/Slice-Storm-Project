# Game result validation

Game sessions are authenticated and owned by the user who starts them. The
server records the start time, accepts only the `classic` mode, validates
numeric ranges, checks that a session is still active, and updates player
statistics only after a successful completion.

These checks are basic integrity validation, not anti-cheat protection. A
browser-submitted score can still be manipulated by a determined player because
the client controls the reported gameplay result. Stronger protection would
require server-authoritative gameplay or trusted event telemetry.
