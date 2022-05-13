import { useState } from 'react';
import Videos from './components/Videos'
import Menu from './components/Menu';


function App() {
  const [ currentPage, setCurrentPage ] = useState( "home" );
  const [ joinCode, setJoinCode ] = useState( "" );

  return (
    <div className="app">
      { currentPage === "home" ? (
        <Menu
          joinCode={ joinCode }
          setJoinCode={ setJoinCode }
          setPage={ setCurrentPage }
        />
      ) : (
        <Videos
          mode={ currentPage }
          callId={ joinCode }
          setPage={ setCurrentPage }
        />
      ) }
    </div>
  );
}

export default App;
