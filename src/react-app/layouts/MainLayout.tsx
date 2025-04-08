import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/nav/Navbar';

const MainLayout = () => {
  return (
    <>
      <Navbar />
      <main className="main-content">
        <Outlet />
      </main>
    </>
  );
};

export default MainLayout; 