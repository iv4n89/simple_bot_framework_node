import axios from "axios";
import { CardFactory, Activity, ActivityTypes } from "botbuilder";
import { ComponentDialog, DialogTurnResult, WaterfallDialog, WaterfallStepContext } from "botbuilder-dialogs";


export class RandomCatDialog extends ComponentDialog {

    public static id: string = 'catDialog';

    constructor() {
        super(RandomCatDialog.id);
        this.initialDialogId = RandomCatDialog.id;
        this.addDialog(new WaterfallDialog(RandomCatDialog.id, [
            this.fetchCat.bind(this),
        ]));
    }

    private async fetchCat(stepContext: WaterfallStepContext): Promise<DialogTurnResult> {
        const image = await (await axios.get('https://api.thecatapi.com/v1/images/search')).data[0].url;
        const card = CardFactory.heroCard(
            'A random cat image',
            CardFactory.images([image])
        );
        const activity: Partial<Activity> = {
            type: ActivityTypes.Message,
            text: '',
            attachments: [card]
        };
        await stepContext.context.sendActivity(activity);
        return stepContext.endDialog();
    }
}