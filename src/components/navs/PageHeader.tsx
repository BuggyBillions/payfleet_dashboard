import React from 'react'
import type { PageHeaderProps } from '../../lib/interfaces'

const PageHeader: React.FC<PageHeaderProps> = ({
    heading="Welcome",
    value="Here is your business breakdown"
}) => {
    return (
        <div className="flex items-center justify-between mb-4">
            <div className="flex flex-col">
                <h2 className="text-lg font-semibold text-textBlack">
                    {heading}
                </h2>
                <p className="text-sm text-textBlack">
                    {value}
                </p>
            </div>
        </div>
    )
}

export default PageHeader