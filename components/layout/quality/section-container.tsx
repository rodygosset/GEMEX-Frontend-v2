

interface Props {
    children: any;
}

const SectionContainer = ({ children }: Props) => {


    return (
        <section 
            className="min-w-[300px] flex-1 p-[32px] rounded-[0.8rem] bg-white bg-opacity-10 shadow-2xl shadow-primary/20
                        h-full flex flex-col gap-4">
            {children}
        </section>
    )

}

export default SectionContainer