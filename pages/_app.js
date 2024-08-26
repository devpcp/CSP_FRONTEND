import { wrapper } from '../redux/store'
import Initiative from '../components/_App/Initiative'
import 'antd/dist/antd.css';
import '../public/assets/styles/app/app.scss';
import '../public/assets/scss/main.scss'


function App({ Component, pageProps }) {
  return (
    <Initiative>
      <Component {...pageProps} />
    </Initiative>
  )
}

export default wrapper.withRedux(App)
