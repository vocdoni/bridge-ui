import { Header } from './header'
import { Footer } from './footer'
import { MessageAlert } from './msg-alert'
import { LoadingAlert } from './loading-alert'

export const Layout = ({ children }) => <>
    <MessageAlert />
    <LoadingAlert />
    <Header />
    <div id="main">
        {children}
    </div>
    <Footer />
</>
