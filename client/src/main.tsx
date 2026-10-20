import { lazy, StrictMode, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router';
import { Layout } from './components/Layout';
import { ThemeProvider } from './lib/theme';
import './index.css';
import Home from './pages/Home';
import NotFound from './pages/NotFound';

const Events = lazy(() => import('./pages/Events'));
const EventDetail = lazy(() => import('./pages/EventDetail'));
const Trails = lazy(() => import('./pages/Trails'));
const Campsites = lazy(() => import('./pages/Campsites'));
const Community = lazy(() => import('./pages/Community'));
const Brand = lazy(() => import('./pages/Brand'));

const Fallback = () => <div className="min-h-screen bg-deep" />;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <BrowserRouter>
        <Suspense fallback={<Fallback />}>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="events" element={<Events />} />
              <Route path="events/:slug" element={<EventDetail />} />
              <Route path="trails" element={<Trails />} />
              <Route path="trails/:slug" element={<Trails />} />
              <Route path="campsites" element={<Campsites />} />
              <Route path="community" element={<Community />} />
              <Route path="brand" element={<Brand />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>,
);
