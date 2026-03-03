import React from 'react'
import withSessionContext from '../HOC/withSessionContext'

function Footer(props) {
  return (
    <footer className="bg-gradient-to-r from-gray-800 via-gray-900 to-black dark:from-gray-900 dark:via-gray-800 dark:to-black shadow-inner rounded-xl">
          <div className="mx-auto px-4 py-4 text-center text-sm text-gray-200 dark:text-gray-300">
            <p>© {new Date().getFullYear()}{" "}<span className="font-semibold text-white dark:text-white">Developed by P&BD-IS</span>. All rights reserved.</p>
          </div>
        </footer>
  )
}

export default withSessionContext(Footer)