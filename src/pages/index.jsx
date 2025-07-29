import Layout from "./Layout.jsx";

import Stats from "./Stats";

import Home from "./Home";

import Pipmaster from "./Pipmaster";

import OpeningBook from "./OpeningBook";

import PlayComputer from "./PlayComputer";

import Test from "./Test";

import Strategies from "./Strategies";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Stats: Stats,
    
    Home: Home,
    
    Pipmaster: Pipmaster,
    
    OpeningBook: OpeningBook,
    
    PlayComputer: PlayComputer,
    
    Test: Test,
    
    Strategies: Strategies,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Stats />} />
                
                
                <Route path="/Stats" element={<Stats />} />
                
                <Route path="/Home" element={<Home />} />
                
                <Route path="/Pipmaster" element={<Pipmaster />} />
                
                <Route path="/OpeningBook" element={<OpeningBook />} />
                
                <Route path="/PlayComputer" element={<PlayComputer />} />
                
                <Route path="/Test" element={<Test />} />
                
                <Route path="/Strategies" element={<Strategies />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}