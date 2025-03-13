import React, { Suspense, lazy, useContext, useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';

import Channel from './pages/Channel';
import Chat from './pages/Chat';
import Chat2Link from './pages/Chat2Link';
import EditChannel from './pages/Channel/EditChannel';
import EditUser from './pages/User/EditUser';
import Loading from './components/Loading';
import Log from './pages/Log';
import LoginForm from './components/LoginForm';
import Midjourney from './pages/Midjourney';
import NotFound from './pages/NotFound';
import OAuth2Callback from "./components/OAuth2Callback.js";
import PasswordResetConfirm from './components/PasswordResetConfirm';
import PasswordResetForm from './components/PasswordResetForm';
import PersonalSetting from './components/PersonalSetting.js';
import Playground from './pages/Playground/Playground.js';
import Pricing from './pages/Pricing/index.js';
import { PrivateRoute } from './components/PrivateRoute';
import Redemption from './pages/Redemption';
import RegisterForm from './components/RegisterForm';
import Setting from './pages/Setting';
import ShadcnDemoPage from './pages/ShadcnDemo';
import Task from "./pages/Task/index.js";
import Token from './pages/Token';
import TopUp from './pages/TopUp';
import User from './pages/User';

const Home = lazy(() => import('./pages/Home'));
const Detail = lazy(() => import('./pages/Detail'));
const About = lazy(() => import('./pages/About'));

function App() {
  const location = useLocation();
  
  return (
    <>
      <Routes>
        <Route
          path='/'
          element={
            <Suspense fallback={<Loading></Loading>} key={location.pathname}>
              <Home />
            </Suspense>
          }
        />
        <Route
          path='/channel'
          element={
            <PrivateRoute>
              <Channel />
            </PrivateRoute>
          }
        />
        <Route
          path='/channel/edit/:id'
          element={
            <Suspense fallback={<Loading></Loading>} key={location.pathname}>
              <EditChannel />
            </Suspense>
          }
        />
        <Route
          path='/channel/add'
          element={
            <Suspense fallback={<Loading></Loading>} key={location.pathname}>
              <EditChannel />
            </Suspense>
          }
        />
        <Route
          path='/token'
          element={
            <PrivateRoute>
              <Token />
            </PrivateRoute>
          }
        />
        <Route
          path='/playground'
          element={
            <PrivateRoute>
              <Playground />
            </PrivateRoute>
          }
        />
        <Route
          path='/redemption'
          element={
            <PrivateRoute>
              <Redemption />
            </PrivateRoute>
          }
        />
        <Route
          path='/user'
          element={
            <PrivateRoute>
              <User />
            </PrivateRoute>
          }
        />
        <Route
          path='/user/edit/:id'
          element={
            <Suspense fallback={<Loading></Loading>} key={location.pathname}>
              <EditUser />
            </Suspense>
          }
        />
        <Route
          path='/user/edit'
          element={
            <Suspense fallback={<Loading></Loading>} key={location.pathname}>
              <EditUser />
            </Suspense>
          }
        />
        <Route
          path='/user/reset'
          element={
            <Suspense fallback={<Loading></Loading>} key={location.pathname}>
              <PasswordResetConfirm />
            </Suspense>
          }
        />
        <Route
          path='/login'
          element={
            <Suspense fallback={<Loading></Loading>} key={location.pathname}>
              <LoginForm />
            </Suspense>
          }
        />
        <Route
          path='/register'
          element={
            <Suspense fallback={<Loading></Loading>} key={location.pathname}>
              <RegisterForm />
            </Suspense>
          }
        />
        <Route
          path='/reset'
          element={
            <Suspense fallback={<Loading></Loading>} key={location.pathname}>
              <PasswordResetForm />
            </Suspense>
          }
        />
        <Route
          path='/oauth/github'
          element={
            <Suspense fallback={<Loading></Loading>} key={location.pathname}>
              <OAuth2Callback type='github'></OAuth2Callback>
            </Suspense>
          }
        />
        <Route
            path='/oauth/oidc'
            element={
                <Suspense fallback={<Loading></Loading>}>
                    <OAuth2Callback type='oidc'></OAuth2Callback>
                </Suspense>
            }
        />
        <Route
          path='/oauth/linuxdo'
          element={
            <Suspense fallback={<Loading></Loading>} key={location.pathname}>
                <OAuth2Callback type='linuxdo'></OAuth2Callback>
            </Suspense>
          }
        />
        <Route
          path='/setting'
          element={
            <PrivateRoute>
              <Suspense fallback={<Loading></Loading>} key={location.pathname}>
                <Setting />
              </Suspense>
            </PrivateRoute>
          }
        />
        <Route
          path='/personal'
          element={
            <PrivateRoute>
              <Suspense fallback={<Loading></Loading>} key={location.pathname}>
                <PersonalSetting />
              </Suspense>
            </PrivateRoute>
          }
        />
        <Route
          path='/topup'
          element={
            <PrivateRoute>
              <Suspense fallback={<Loading></Loading>} key={location.pathname}>
                <TopUp />
              </Suspense>
            </PrivateRoute>
          }
        />
        <Route
          path='/log'
          element={
            <PrivateRoute>
              <Log />
            </PrivateRoute>
          }
        />
        <Route
          path='/detail'
          element={
            <PrivateRoute>
              <Suspense fallback={<Loading></Loading>} key={location.pathname}>
                <Detail />
              </Suspense>
            </PrivateRoute>
          }
        />
        <Route
          path='/midjourney'
          element={
            <PrivateRoute>
              <Suspense fallback={<Loading></Loading>} key={location.pathname}>
                <Midjourney />
              </Suspense>
            </PrivateRoute>
          }
        />
        <Route
          path='/task'
          element={
            <PrivateRoute>
              <Suspense fallback={<Loading></Loading>} key={location.pathname}>
                <Task />
              </Suspense>
            </PrivateRoute>
          }
        />
        <Route
          path='/pricing'
          element={
            <Suspense fallback={<Loading></Loading>} key={location.pathname}>
              <Pricing />
            </Suspense>
          }
        />
        <Route
          path='/about'
          element={
            <Suspense fallback={<Loading></Loading>} key={location.pathname}>
              <About />
            </Suspense>
          }
        />
        <Route
          path='/chat/:id?'
          element={
            <Suspense fallback={<Loading></Loading>} key={location.pathname}>
              <Chat />
            </Suspense>
          }
        />
        {/* 方便使用chat2link直接跳转聊天... */}
          <Route
            path='/chat2link'
            element={
              <PrivateRoute>
                <Suspense fallback={<Loading></Loading>} key={location.pathname}>
                    <Chat2Link />
                </Suspense>
              </PrivateRoute>
            }
          />
        <Route
          path='/ui-demo'
          element={
            <Suspense fallback={<Loading></Loading>} key={location.pathname}>
              <ShadcnDemoPage />
            </Suspense>
          }
        />
        <Route path='*' element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;
