import { ChoiceFactory, ChoicePrompt, ComponentDialog, ConfirmPrompt, DialogTurnResult, TextPrompt, WaterfallDialog, WaterfallStepContext } from "botbuilder-dialogs";
import { HelperDialog } from "./helperDialog";
import { OwnerResolverDialog } from "./ownerResolverDialog";
import { SiteDetails } from "./siteDetails";

const TEXT_PROMPT = 'textPrompt';
const CHOICE_PROMPT = 'choicePrompt';
const OWNER_RESOLVER_DIALOG = 'ownerResolverDialog';
const CONFIRM_PROMPT = 'confirmPrompt';
const WATERFALL_DIALOG = 'waterfallDialog';

export class SiteDialog extends HelperDialog {

    constructor(id: string) {
        super(id ||  'siteDialog');
        this
            .addDialog(new ChoicePrompt(CHOICE_PROMPT))
            .addDialog(new TextPrompt(TEXT_PROMPT))
            .addDialog(new OwnerResolverDialog(OWNER_RESOLVER_DIALOG))
            .addDialog(new ConfirmPrompt(CONFIRM_PROMPT))
            .addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
                this.siteTypeStep.bind(this),
                this.titleStep.bind(this),
                this.descriptionStep.bind(this),
                this.ownerStep.bind(this),
                this.aliasStep.bind(this),
                this.confirmStep.bind(this),
                this.finalStep.bind(this)
            ]));

        this.initialDialogId = WATERFALL_DIALOG;
    }

    public async siteTypeStep(stepContext: WaterfallStepContext): Promise<DialogTurnResult> {
        const siteDetails = stepContext.options as SiteDetails;

        if (!siteDetails.siteType) {
            return await stepContext.prompt(CHOICE_PROMPT, {
                choices: ChoiceFactory.toChoices(['Team Site', 'Communcation Site']),
                prompt: 'Select site type',
            });
        } else {
            return await stepContext.next(siteDetails.siteType);
        }
    }

    public async titleStep(stepContext: WaterfallStepContext): Promise<DialogTurnResult> {
        const siteDetails = stepContext.options as SiteDetails;

        siteDetails.siteType = stepContext.result.value;

        if (!siteDetails.title) {
            const promptText = 'Provide a title for your site';
            return await stepContext.prompt(TEXT_PROMPT, { prompt: promptText });
        } else {
            return await stepContext.next(siteDetails.title);
        }
    }

    public async descriptionStep(stepContext: WaterfallStepContext): Promise<DialogTurnResult> {
        const siteDetails = stepContext.options as SiteDetails;

        siteDetails.title = stepContext.result;

        if (!siteDetails.owner) {
            const text = 'Provide a description for your site';
            return await stepContext.prompt(TEXT_PROMPT, { prompt: text });
        } else {
            return await stepContext.next(siteDetails.owner);
        }
    }

    public async ownerStep(stepContext: WaterfallStepContext): Promise<DialogTurnResult> {
        const siteDetails = stepContext.options as SiteDetails;

        siteDetails.description = stepContext.result;

        if (!siteDetails.owner) {
            return await stepContext.beginDialog(OWNER_RESOLVER_DIALOG, { siteDetails });
        } else {
            return await stepContext.next(siteDetails.owner);
        }
    }

    public async aliasStep(stepContext: WaterfallStepContext): Promise<DialogTurnResult> {
        const siteDetails = stepContext.options as SiteDetails;

        siteDetails.owner = stepContext.result;

        if (siteDetails.siteType === 'Communication Site') {
            return await stepContext.next();
        } else {
            if (!siteDetails.alias) {
                const text = 'Provide an alias for your site';
                return await stepContext.prompt(TEXT_PROMPT, { prompt: text });
            } else {
                return await stepContext.next(siteDetails.alias);
            }
        }
    }

    public async confirmStep(stepContext: WaterfallStepContext): Promise<DialogTurnResult> {
        const siteDetails = stepContext.options as SiteDetails;

        siteDetails.alias = stepContext.result;

        const msg = `A summary of your request:\n
                    Title: ${ siteDetails.title } \n\n
                    Owner: ${ siteDetails.owner } \n\n
                    Description: ${ siteDetails.description } \n\n
                    Site type: ${ siteDetails.siteType } \n\n
                    Alias: ${ siteDetails.alias } \n\n
                    Is this correct?`;

        return await stepContext.prompt(CONFIRM_PROMPT, { prompt: msg });
    }

    public async finalStep(stepContext: WaterfallStepContext): Promise<DialogTurnResult> {
        if (stepContext.result === null) {
            const siteDetails = stepContext.options as SiteDetails;
            return await stepContext.endDialog(siteDetails);
        } else {
            return await stepContext.endDialog();
        }
    }
}