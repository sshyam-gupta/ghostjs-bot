// Deployments API example
// See: https://developer.github.com/v3/repos/deployments/ to learn more

/**
 * This is the main entrypoint to your Probot app
 * @param {import('probot').Probot} app
 */

const { AdminAPI } = require("./src/ghost-api");
const { apiRequest } = require("./src/api");
const REGEX_POST_ID = /\/editor\/post\/(?<postId>\w+)/gm;
const FILE_STATUS = {
  Added: "added",
  Removed: "removed",
  Modified: "modified",
};

const USER_TYPE = {
  Bot: "Bot",
  User: "User",
};

module.exports = (app) => {
  app.log.info("Yay, the app was loaded!");
  app.on(["pull_request.opened"], async (context) => {
    const pr = context.payload.pull_request;
    const user = pr.user.login;

    const prFiles = await apiRequest(`pulls/${pr.number}/files`);

    const mdFile = prFiles.filter(
      (file) =>
        file.status === FILE_STATUS.Added &&
        file.filename.toLowerCase().includes(".md")
    );

    if (!mdFile || !mdFile[0]) {
      return;
    }

    const rawFile = await apiRequest(mdFile[0].raw_url);

    const mobiledoc = JSON.stringify({
      version: "0.3.1",
      markups: [],
      atoms: [],
      cards: [["markdown", { cardName: "markdown", markdown: rawFile }]],
      sections: [[10, 0]],
    });

    const post = await AdminAPI.posts.add({
      title: pr.title,
      mobiledoc,
    });

    app.log.info({ post });

    const baseURL = new URL(post.url).origin;

    const msg = context.issue({
      body: `Hey @${user} 👋, thanks for your contribution.

This pull request is being automatically in sync with ghost previews!

🔍 Post: [${baseURL}/ghost/#/editor/post/${post.id}](${baseURL}/ghost/#/editor/post/${post.id})  
✅ Post Preview: [${post.url}](${post.url})
`,
    });

    await context.octokit.issues.createComment(msg);
  });

  app.on(["pull_request.synchronize"], async (context) => {
    const pr = context.payload.pull_request;
    const user = pr.user.login;

    const prFiles = await apiRequest(`pulls/${pr.number}/files`);
    const comments = await apiRequest(`issues/${pr.number}/comments`);

    const mdFile = prFiles.filter(
      (file) =>
        file.status === FILE_STATUS.Added &&
        file.filename.toLowerCase().includes(".md")
    );

    const previewComment = comments.find(
      (comment) =>
        comment.user.type === USER_TYPE.Bot && comment.body.includes("Post: ")
    );

    if (!mdFile || !mdFile[0] || !previewComment) {
      return;
    }

    const rawFile = await apiRequest(mdFile[0].raw_url);

    const mobiledoc = JSON.stringify({
      version: "0.3.1",
      markups: [],
      atoms: [],
      cards: [["markdown", { cardName: "markdown", markdown: rawFile }]],
      sections: [[10, 0]],
    });

    app.log.info({ rawFile, title: pr.title, mobiledoc });

    const match = REGEX_POST_ID.exec(previewComment.body).groups;

    const currentPost = await AdminAPI.posts.read({
      id: match.postId,
    });

    app.log.info({ currentPost });

    const editedPost = await AdminAPI.posts.edit({
      id: match.postId,
      title: pr.title,
      updated_at: currentPost.updated_at,
      mobiledoc,
    });

    app.log.info({ editedPost });
  });
};
