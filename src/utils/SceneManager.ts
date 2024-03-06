import GroupConversation from "../structures/GroupConversation";
import UserConversation from "../structures/UserConversation";

const TAG = "[SceneManager] ";


export interface SceneInterface {
    name: string;
    message: string;
    onReply: (reply, context) => void;
}

export class Scene implements SceneInterface {
    name: string;
    message: string;
    onReply: (reply, context) => void;

    constructor(name, message, onReply) {
        this.name = name;
        this.message = message;
        this.onReply = onReply;
    }
}

export interface Performance {
    scene?: Scene;
    state?: any;
    conversation?: UserConversation | GroupConversation;
}

export class SceneManager {

    performances: { [id: string]: Performance };
    scenes: Scene[];
    valid;

    constructor() {
        this.performances = {};
        this.scenes = [];
        this.valid = false;
    }

    verify() {
        if (this.scenes.length == 0) throw TypeError("More then one scene is required!");
        for (const scene of this.scenes) {
            if (this.scenes.filter(i => i.name == scene.name).length > 1)
                throw TypeError("Every Scene needs an unique name!");
        }
        this.valid = true;
    }

    perform(initCommand, userConversation, reply) {
        if (!this.valid) {
            throw TypeError("SceneManager needs to be verified before performing!");
        }
        if (reply.trim().length == 0)
            return;
        console.log(TAG + "perform(" + userConversation.id + "," + reply + ")");

        // Existing performance
        if (this.performances[userConversation.id] != null) {
            console.log(TAG + "Performance exists already!");
            var performance = this.performances[userConversation.id];
            var scene = this.scenes.filter(i => i.name == performance.scene.name)[0];
            scene.onReply(reply, {
                user: userConversation.id,
                state: this.performances[userConversation.id].state,
                next: (sceneName, noMessage = false) => {
                    this.next(userConversation.id, sceneName, noMessage)
                },
                reply: (msg) => {
                    this.reply(userConversation.id, msg)
                },
                finish: (msg) => {
                    if (msg != null) this.reply(userConversation.id, msg);
                    this.performances[userConversation.id] = null;
                }
            })
            return;
        }
        if (initCommand && initCommand == reply.trim()) {
            console.log(TAG + "Starting new Performance!");
            this.performances[userConversation.id] = {};
            this.performances[userConversation.id].scene = this.scenes[0];
            this.performances[userConversation.id].state = {};
            this.performances[userConversation.id].conversation = userConversation;
            this.executeScene(this.performances[userConversation.id]);
        }
    }

    executeScene(performance, noMessage?) {
        var scene = this.scenes.filter(i => i.name == performance.scene)[0];
        if (!noMessage)
            performance.conversation.sendMessage(scene.message);
    }

    addScene(scene) {
        this.scenes.push(scene);
        return this;
    }

    next(id, sceneName, noMessage) {
        this.performances[id].scene = sceneName;
        this.executeScene(this.performances[id], noMessage);
    }

    reply(id, message) {
        this.performances[id].conversation.sendMessage(message, []);
    }

}