
exports.fetchNodeEnv = (data, emitter, currentUserID, response, request, ipc) => {
    emitter('fetchNodeEnv', { success: true, result: { argv: [process.argv[0]], env: process.env, ffmpegPath: ipc.ffmpegPath } });
}
