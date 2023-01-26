import styles from "@styles/page-templates/view-template.module.scss"


interface Props {
    children: any;
}

const ViewTemplate = (
    {
        children
    }: Props
) => {

    // render

    return (
        <main id={styles.container}>
            { children }
        </main>
    )
}


export default ViewTemplate