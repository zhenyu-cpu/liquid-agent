| Feature | macOS | Linux | Status | Evidence |
| Chat/web UI startup | yes | yes | PASS | server startup on Linux |
| Build/typecheck | yes | yes | PASS | npm build/typecheck |
| Open links/files/apps | open | xdg-open | PARTIAL | runTool open URL PASS |
| Clipboard | pbpaste/pbcopy | wl-clipboard/xclip/xsel | PARTIAL | mocked PASS, real tools absent |
| Notifications | osascript | notify-send | PARTIAL | code implemented, tool absent |
