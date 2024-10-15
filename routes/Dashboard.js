
import { useDispatch, useSelector } from 'react-redux';
import DashboardEmployee from './Dashboard/DashboardEmployee';
import DashboardManager from './Dashboard/DashboardManager';

const Dashboard = () => {
    const { authUser } = useSelector(({ auth }) => auth);
    let index = authUser.Groups.findIndex(x => x.id === "626b03fe-4642-40af-af97-8cb2ac2e6296")

    return (
        <>
            {index === -1 ?
                <DashboardEmployee /> :
                <DashboardManager />
            }

        </>
    )
}

export default Dashboard
