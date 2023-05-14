import { ActivityTypes, StatePropertyAccessor, TurnContext } from "botbuilder";
import { ComponentDialog, Dialog, DialogContext, DialogSet, DialogState, DialogTurnResult, DialogTurnStatus, WaterfallDialog, WaterfallStepContext } from "botbuilder-dialogs";
import { RandomCatDialog } from "./randomCatDialog";
import { SiteDetails } from "./siteDetails";
import { SiteDialog } from "./siteDialog";

const SITE_DIALOG = 'siteDialog';
const MAIN_WATERFALL_DIALOG = 'waterfallDialog';
const RANDOM_CAT_DIALOG = 'catDialog';

export class MainDialog extends ComponentDialog {

    constructor(id: string) {
        super();
        this.id = id;

        this.addDialog(new SiteDialog(SITE_DIALOG));
        this.addDialog(new RandomCatDialog());
        this.addDialog(new WaterfallDialog(MAIN_WATERFALL_DIALOG, [
            this.initialStep.bind(this),
            this.finalStep.bind(this),
        ]));

        this.initialDialogId = MAIN_WATERFALL_DIALOG;
    }

    public async run(context: any, accessor: any) {
        const dialogSet = new DialogSet(accessor);
        dialogSet.add(this);

        const dialogContext = await dialogSet.createContext(context);
        const results = await dialogContext.continueDialog();
        if (results.status === DialogTurnStatus.empty) {
            await dialogContext.beginDialog(this.id);
        }

    }

    private async initialStep(stepContext: WaterfallStepContext): Promise<DialogTurnResult> {
        // const siteDetails = new SiteDetails();
        // return await stepContext.beginDialog(SITE_DIALOG, siteDetails);
        // await stepContext.context.sendActivity(JSON.stringify(stepContext.context.activity.text));
        // await stepContext.context.sendActivity(stepContext.context.activity.text);
        if (/^(get|fetch|dame|quiero|watch|ver|random){1,}(.*){0,}(cat|gato){1,}$/.test(stepContext.context.activity.text)) {
            return await stepContext.beginDialog(RANDOM_CAT_DIALOG);
        } else {
            return await stepContext.next();
        }
    }

    private async finalStep(stepContext: WaterfallStepContext): Promise<DialogTurnResult> {
        // if (stepContext.result) {
        //     const result = stepContext.result  as SiteDetails;
        //     const msg = `I have created a ${ JSON.stringify(result) }`;
        //     await stepContext.context.sendActivity(msg);
        // }
        // return await stepContext.endDialog();
        await stepContext.context.sendActivity('Desde el final step');
        return await stepContext.endDialog();
    }

}