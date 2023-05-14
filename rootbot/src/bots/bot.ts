// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import axios from 'axios';
import { ActivityHandler, MessageFactory, CardFactory, Activity, ActivityFactory, ActivityTypes, ActionTypes, CardAction, ConversationState, UserState, StatePropertyAccessor } from 'botbuilder';
import { Dialog, DialogState } from 'botbuilder-dialogs';
import { MainDialog } from '../dialogs/mainDialog';

const CONVERSATION_DATA_PROPERTY = 'conversationData';
const USER_PROFILE_PROPERTY = 'userProfile';

export class RootBot extends ActivityHandler {
    conversationDataAccessor: StatePropertyAccessor<any>;
    userProfileAccessor: StatePropertyAccessor<any>;
    conversationState: ConversationState;
    userState: UserState;
    private dialog: Dialog;
    private dialogState: StatePropertyAccessor<DialogState>;
    constructor(conversationState: ConversationState, userState: UserState, dialog: Dialog) {
        super();
        this.conversationDataAccessor = conversationState.createProperty(CONVERSATION_DATA_PROPERTY);
        this.userProfileAccessor = userState.createProperty(USER_PROFILE_PROPERTY);
        this.conversationState = conversationState;
        this.userState = userState;
        this.dialog = dialog;
        this.dialogState = this.conversationState.createProperty<DialogState>('DialogState');
        // See https://aka.ms/about-bot-activity-message to learn more about the message and other activity types.
        this.onMessage(async (context, next) => {
            // if (context.activity.text === 'hola') {
            //     const buttons: CardAction[] = [
            //         { type: ActionTypes.ImBack, title: 'button 1', value: '1' },
            //         { type: ActionTypes.ImBack, title: 'button 2', value: '2' },
            //         { type: ActionTypes.ImBack, title: 'button 3', value: '3' },
            //     ]
            //     const card = CardFactory.heroCard('test card', null, buttons);
            //     const activity: Partial<Activity> = {
            //         attachments: [card],
            //         type: ActivityTypes.Message
            //     };
            //     await context.sendActivity(activity);
            //     return await next();
            // }
            // if (context.activity.text === 'event card') {
            //     const card = CardFactory.heroCard(
            //         'Event card',
            //         CardFactory.images(['https://cataas.com/cat']),
            //         CardFactory.actions([
            //             {
            //                 type: ActionTypes.OpenUrl,
            //                 title: 'An url',
            //                 value: 'https://www.google.es/'
            //             }
            //         ])
            //     );
            //     const activity: Partial<Activity> = {
            //         attachments: [
            //             card
            //         ],
            //         type: ActivityTypes.Message,
            //         text: '',
            //     };
            //     await context.sendActivity(activity);
            //     return await next();
            // }
            // if (/^(get|fetch|dame|quiero|watch|ver|random){1,}(.*){0,}(cat|gato){1,}$/.test(context.activity.text)) {
            //     const image = await (await axios.get('https://api.thecatapi.com/v1/images/search')).data[0].url;
            //     const card = CardFactory.heroCard(
            //         'A random cat image',
            //         CardFactory.images([image])
            //     );
            //     const activity: Partial<Activity> = {
            //         type: ActivityTypes.Message,
            //         text: '',
            //         attachments: [card]
            //     };
            //     await context.sendActivity(activity);
            //     return await next();
            // }

            // if (context.activity.text === 'userState') {
            //     await context.sendActivity(JSON.stringify(this.userState, null, 2));
            //     return await next();
            // }

            // if (context.activity.text === 'conversationState') {
            //     await context.sendActivity(JSON.stringify(this.conversationState, null, 2));
            //     return await next();
            // }
            // const replyText = `Echo bot: ${ context.activity.text }`;
            // await context.sendActivity(MessageFactory.text(replyText, replyText));
            // // By calling next() you ensure that the next BotHandler is run.
            await (this.dialog as MainDialog).run(context, this.dialogState);
            await next();
        });

        this.onDialog(async (context, next) => {
            await this.conversationState.saveChanges(context, false);
            await this.userState.saveChanges(context, false);

            await next();
        })

        this.onMembersAdded(async (context, next) => {
            const membersAdded = context.activity.membersAdded;
            const welcomeText = 'Hello and welcome!';
            for (const member of membersAdded) {
                if (member.id !== context.activity.recipient.id) {
                    await context.sendActivity(MessageFactory.text(welcomeText, welcomeText));
                }
            }
            // By calling next() you ensure that the next BotHandler is run.
            await next();
        });
    }
}
