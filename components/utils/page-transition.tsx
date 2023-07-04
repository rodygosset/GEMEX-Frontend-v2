import { AnimatePresence, motion } from "framer-motion"

import styles from '@styles/components/utils/page-transition.module.scss'
import { useRouter } from "next/router"

interface Props {
    children: any;
}

const PageTransition = ({ children }: Props) => {

    const { asPath } = useRouter()

    // handle page transitions with framer motion

	const variants = {
		out: {
			opacity: 0,
			y: 40,
			transition: {
				duration: 0.3,
				ease: "easeInOut"
			}
		},
		in: {
			opacity: 1,
			y: 0,
			transition: {
				duration: 0.3,
				ease: "easeInOut"
			}
		}
	}

    // render

    return (
        <div className={styles.wrapper}>
            <AnimatePresence initial={false} mode="wait">
                <motion.div 
                    key={asPath}
                    id={styles.container}
                    variants={variants}
                    animate="in"
                    initial="out"
                    exit="out">
                    {children}
                </motion.div>
            </AnimatePresence>
        </div>
    )

}

export default PageTransition