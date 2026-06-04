'use client'

import { cn } from '@/lib/utils'
import Icon from "@mdi/react"
import { AnimatePresence, motion } from 'framer-motion'
import Link from "next/link"
import React, { createContext, useContext, useState } from 'react'

const DirectionContext = createContext<{
    direction: 'rtl' | 'ltr' | null
    setAnimationDirection: (tab: number | null) => void
    leftPos: number | null
    setLeftPos: (pos: number | null) => void
} | null>(null)

const CurrentTabContext = createContext<{
    currentTab: number | null
} | null>(null)

export const Dropdown: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentTab, setCurrentTab] = useState<null | number>(null)
    const [direction, setDirection] = useState<'rtl' | 'ltr' | null>(null)
    const [leftPos, setLeftPos] = useState<number | null>(null)

    const setAnimationDirection = (tab: number | null) => {
        if (typeof currentTab === 'number' && typeof tab === 'number') {
            setDirection(currentTab > tab ? 'rtl' : 'ltr')
        } else if (tab === null) {
            setDirection(null)
        }

        setCurrentTab(tab)
    }

    return (
        <DirectionContext.Provider value={{ direction, setAnimationDirection, leftPos, setLeftPos }}>
            <CurrentTabContext.Provider value={{ currentTab }}>
                <span
                    onMouseLeave={() => {
                        setAnimationDirection(null)
                    }}
                    className={'relative flex h-fit gap-2'}>
                    {children}
                </span>
            </CurrentTabContext.Provider>
        </DirectionContext.Provider>
    )
}

export const TriggerWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { currentTab } = useContext(CurrentTabContext)!
    const { setAnimationDirection, setLeftPos } = useContext(DirectionContext)!

    return (
        <>
            {React.Children.map(children, (e: any, i) => {
                const isHovered = currentTab === i + 1;
                const isSelected = e.props.selected;

                const content = (
                    <button
                        onMouseEnter={(event) => {
                            if (e.props.hasSubNav) {
                                setAnimationDirection(i + 1)
                                const rect = event.currentTarget;
                                setLeftPos(rect.offsetLeft + rect.offsetWidth / 2)
                            } else {
                                setAnimationDirection(null)
                            }
                        }}
                        onClick={() => {
                            if (e.props.hasSubNav) {
                                setAnimationDirection(i + 1)
                            }
                        }}
                        className={cn(
                            "group flex h-10 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-all duration-300 border cursor-pointer",
                            isSelected
                                ? "bg-accent/10 text-accent border-accent/20"
                                : isHovered && e.props.hasSubNav
                                    ? "text-accent bg-white/5 border-transparent"
                                    : "text-neutral-400 border-transparent hover:text-accent hover:bg-white/5"
                        )}>
                        {e}
                    </button>
                );

                if (e.props.href) {
                    return <Link href={e.props.href} key={i}>{content}</Link>;
                }
                return <React.Fragment key={i}>{content}</React.Fragment>;
            })}
        </>
    )
}

export const Trigger: React.FC<{ children: React.ReactNode; className?: string; icon?: string; hasSubNav?: boolean; href?: string; selected?: boolean }> = ({
    children,
    className,
    icon,
    hasSubNav
}) => {
    const { currentTab } = useContext(CurrentTabContext)!

    return (
        <>
            {icon && <Icon path={icon} size={0.8} className="flex-shrink-0" />}
            <span className={cn('', className)}>{children}</span>
            {hasSubNav && (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={cn("relative top-[1px] ml-0.5 transition-transform duration-200",
                        currentTab ? "rotate-180" : ""
                    )}
                    aria-hidden="true">
                    <path d="m6 9 6 6 6-6" />
                </svg>
            )}
        </>
    )
}

export const Tabs: React.FC<{ children: React.ReactNode; className?: string }> = ({
    children,
    className
}) => {
    const { currentTab } = useContext(CurrentTabContext)!
    const { direction, leftPos } = useContext(DirectionContext)!
    return (
        <>
            <motion.div
                id="overlay-content"
                initial={{
                    opacity: 0,
                    scale: 0.98,
                    x: "-50%",
                    y: 10
                }}
                animate={
                    currentTab
                        ? {
                            opacity: 1,
                            scale: 1,
                            left: leftPos || 0,
                            x: "-50%",
                            y: 0
                        }
                        : {
                            opacity: 0,
                            scale: 0.98,
                            x: "-50%",
                            y: 10,
                            left: leftPos || 0 // Fix: keep position while fading out
                        }
                }
                transition={{
                    left: { duration: 0 },
                    opacity: { duration: 0.2 },
                    scale: { duration: 0.2 },
                    y: { duration: 0.2 }
                }}
                className="absolute top-[calc(100%_+_6px)] w-max z-50">
                <div className="absolute -top-[6px] left-0 right-0 h-[6px]" />
                <div
                    className={cn(
                        'rounded-xl border border-darkBorderV1 bg-darkCardV1/90 backdrop-blur-2xl shadow-2xl transition-all duration-300 overflow-hidden',
                        className
                    )}>
                    {React.Children.map(children, (e, i) => (
                        <div className="overflow-hidden">
                            <AnimatePresence>
                                {currentTab !== null && (
                                    <motion.div exit={{ opacity: 0, y: 5 }}>
                                        {currentTab === i + 1 && (
                                            <motion.div
                                                initial={{
                                                    opacity: 0,
                                                    y: 10
                                                }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.2 }}>
                                                {e}
                                            </motion.div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>
            </motion.div >
        </>
    )
}

export const Tab: React.FC<{ children: React.ReactNode; className?: string }> = ({
    children,
    className
}) => {
    return <div className={cn('h-full w-max min-w-[300px]', className)}>{children}</div>
}
