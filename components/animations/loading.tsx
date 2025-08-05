"use client"

import { motion, Variants } from "motion/react"

function LoadingThreeDotsJumping({color}:{color:string}) {
    const dotVariants: Variants = {
        jump: {
            y: -30,
            transition: {
                duration: 0.8,
                repeat: Infinity,
                repeatType: "mirror",
                ease: "easeInOut",
            },
        },
    }

    return (
        <motion.div
            animate="jump"
            transition={{ staggerChildren: -0.2, staggerDirection: -1 }}
            className="container h-screen bg-grey-500 opacity-50"
        >
            <motion.div className="dot"variants={dotVariants} />
            <motion.div className="dot" variants={dotVariants} />
            <motion.div className="dot" variants={dotVariants} />
            <StyleSheet color={color}/>
        </motion.div>
    )
}

/**
 * ==============   Styles   ================
 */
function StyleSheet({color}:{color:string}) {
    return (
        <style>
            {`
            .container {
                display: flex;
                justify-content: center;
                align-items: center;
                gap: 10px;
            }

            .dot {
                width: 20px;
                height: 20px;
                border-radius: 50%;
                background-color: ${color};
                will-change: transform;
            }
            `}
        </style>
    )
}
//#2555f5ff
//#25f52fff
//#b123e5ff
export default LoadingThreeDotsJumping
