
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@components/radix/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@components/radix/form";
import { Evaluation, EvaluationCreate } from "@conf/api/data-types/quality-module";
import { faEdit, faFloppyDisk, faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import ItemComboBox from "@components/radix/item-combobox";
import Button from "@components/button";
import { useEffect, useState } from "react";
import { DatePicker } from "@components/radix/date-picker";
import FicheTargetSelect from "@components/page-templates/create/fiche-target-select";
import { ScrollArea } from "@components/radix/scroll-area";

interface Props {
    mois_cycle_id: number;
    evaluation?: Evaluation;
    onSubmit: () => void;
}

// form schema

const formSchema = z.object({
    mois_cycle_id: z.number().min(1, {
        message: "Veuillez sélectionner un mois"
    }),
    thematique_id: z.number().min(1, {
        message: "Veuillez sélectionner une thématique"
    }),
    user_id: z.number().min(1, {
        message: "Veuillez sélectionner un évaluateur"
    }).optional(),
    element_id: z.number().min(1, {
        message: "Veuillez sélectionner un élément"
    }),
    date_rendu: z.date().min(new Date(), {
        message: "La date de rendu doit être supérieure ou égale à la date du jour"
    }),
})

const EvaluationFormModal = (
    {
        mois_cycle_id,
        evaluation,
        onSubmit
    }: Props
) => {

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            mois_cycle_id: mois_cycle_id,
            thematique_id: evaluation ? evaluation.thematique_id : 0,
            user_id: evaluation ? evaluation.user_id : 0,
            element_id: evaluation ? evaluation.element_id : 0,
            date_rendu: evaluation ? new Date(evaluation.date_rendu) : new Date()
        }
    })

    // handlers

    const onSubmitHandler = (data: z.infer<typeof formSchema>) => {
        // todo
        console.log("hello")
        console.log(data)
        form.control._reset()
        setIsOpen(false)
    }

    // state

    const [isOpen, setIsOpen] = useState(false)

    const [expositionId, setExpositionId] = useState<number>(0)


    // render

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            {
                evaluation ?
                <DialogTrigger>
                    <FontAwesomeIcon icon={faEdit} />
                </DialogTrigger>
                :
                <DialogTrigger
                    onClick={() => setIsOpen(true)}
                    className="bg-primary h-fit rounded-[8px] px-[16px] py-[8px] text-sm text-white flex flex-row gap-4 items-center
                            hover:shadow-primary/60 hover:shadow-2xl transition-shadow duration-200 cursor-pointer">
                    <FontAwesomeIcon icon={faPlus} />
                    Nouvelle évaluation
                </DialogTrigger>
            }
            <DialogContent className="sm:max-h-[90vh] sm:h-fit h-screen w-screen sm:w-fit max-sm:max-w-full">
                <ScrollArea className="w-full sm:h-[80vh] h-[95vh]">
                    <DialogHeader className="border-none pb-0">
                        <DialogTitle>
                        {
                            evaluation ?
                            "Modifier l'évaluation"
                            :
                            "Nouvelle évaluation"
                        }
                        </DialogTitle>
                        <DialogDescription>
                        {
                            evaluation ?
                            "Modifier les paramètres de l'évaluation"
                            :
                            "Renseigner les paramètres de l'évaluation"
                        }
                        </DialogDescription>
                    </DialogHeader>
                    <div className="w-full h-[1px] bg-primary/10 my-[16px]"/>
                    <Form {...form}>
                        <form
                            className="flex flex-col gap-[32px]" 
                            onSubmit={form.handleSubmit(onSubmitHandler)}>
                            <FormField
                                control={form.control}
                                name="thematique_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Thématique</FormLabel>
                                        <FormControl>
                                            <ItemComboBox
                                                itemType="thematiques"
                                                onChange={value => form.setValue("thematique_id", value)}
                                                field={field}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Choisir la thématique à évaluer
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="user_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Évaluateur</FormLabel>
                                        <FormControl>
                                            <ItemComboBox
                                                itemType="users"
                                                onChange={value => form.setValue("user_id", value)}
                                                field={field}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Choisir l'évaluateur
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="date_rendu"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Date de rendu prévue</FormLabel>
                                        <FormControl>
                                            <DatePicker
                                                fullWidth
                                                selected={field.value}
                                                onSelect={date => date && form.setValue("date_rendu", date)}
                                                disabled={date => date < new Date()}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Choisir la date de rendu prévue
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="element_id"
                                render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Élément à évaluer</FormLabel>
                                            <FormControl>
                                                <>
                                                <div className="flex flex-col gap-2 flex-1">
                                                    <span className="text-sm text-primary/60">Séléctionner l'exposition de l'élément</span>
                                                    <ItemComboBox
                                                        selected={expositionId}
                                                        itemType="expositions"
                                                        onChange={setExpositionId}
                                                        field={field}
                                                    />
                                                </div>
                                                <div className="flex flex-col gap-2 flex-1">
                                                    <span className="text-sm text-primary/60">Élément</span>
                                                    <ItemComboBox
                                                        itemType="elements"
                                                        searchParams={{ exposition_id: expositionId }}
                                                        onChange={value => form.setValue("element_id", value)}
                                                        field={field}
                                                    />
                                                </div>
                                                </>
                                            </FormControl>
                                            <FormDescription>
                                                Choisir l'élément à évaluer
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                )}
                            />
                            <Button 
                                fullWidth
                                icon={faFloppyDisk}
                                type="submit" 
                                onClick={form.handleSubmit(onSubmitHandler)}>
                                Sauvegarder
                            </Button>
                        </form>
                    </Form>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    )
}

export default EvaluationFormModal
