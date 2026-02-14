import React from 'react'
import { SessionContextConsumer } from '../context/sessionContext'

export default function withSessionContext(WrappedComponent) {
  class C extends React.Component {
    render() {
      return (
        <SessionContextConsumer>
          {(session) => (
            <WrappedComponent {...this.props} sessionContext={session} />
          )}
        </SessionContextConsumer>
      )
    }
  }
  C.displayName = `withSessionContext(${
    WrappedComponent.displayName || WrappedComponent.name
  })`
  return C
}
