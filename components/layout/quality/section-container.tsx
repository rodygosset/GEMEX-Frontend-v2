

interface Props {
    heightFit?: boolean;
    children: any;
}

const SectionContainer = (
    {
        heightFit = false,
        children
    }: Props
) => {


    return (
        <section 
            className={`min-w-[300px] p-[32px] rounded-[0.8rem] bg-white bg-opacity-10 shadow-2xl shadow-primary/20
                        ${ heightFit ? 'h-fit' : 'h-full flex-1' } flex flex-col gap-4`}>
            {children}
        </section>
    )

}

export default SectionContainer