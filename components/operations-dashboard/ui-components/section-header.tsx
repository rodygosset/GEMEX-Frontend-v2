import styles from "@styles/components/operations-dashboard/section-header.module.scss"
import Link from "next/link";


interface Props {
    children: any;
    total: number;
    searchPageLink: string;
}

const SectionHeader = (
    {
        children,
        total,
        searchPageLink
    }: Props
) => {


    // render

    return (
        <div className={styles.sectionHeader}>
            <h4>{ children }</h4>
            <p>
                <span>{ total } au total</span>
                <Link href={searchPageLink}>
                    Voir plus
                </Link>
            </p>
        </div>
    )
}

export default SectionHeader