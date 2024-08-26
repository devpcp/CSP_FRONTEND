import Page from '../components/Hoc/defaultPage';
import asyncComponent from '../util/asyncComponent'

const Login = asyncComponent(() => import('../routes/login'));

export default Page(() => <Login />);
