# Linux Support Delivery Report (In Progress)

## Linux implementation evidence
- Build/typecheck/test PASS on Arch Linux WSL2 x86_64 (Node 24.22.0).
- Server starts on Linux and uses XDG data path.
- Platform abstraction provided in `server/platform.js`.
- Open tool tested with `xdg-open`; clipboard tested with mocked utilities.
- Native utility absence yields clear user-facing errors.
- Install/start scripts support Linux; GitHub Actions added.

## Known blocked/remaining
- Real `notify-send`, `wl-clipboard`, and `xclip` packages absent on this host.
- LLM/model-backed end-to-end chat not exercised.
- macOS regression unavailable in this environment.
