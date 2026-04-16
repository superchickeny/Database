import { useEffect, useState } from 'react'
import TitleBar from './components/TitleBar'

function App(): React.JSX.Element {

  const [query, setQuery] = useState("");
  const [data, setData] = useState();

  useEffect(() => {

  }, []);

  const sendQuery = async (query: string) => {

    const response = await fetch('http://localhost:4000/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: query,
      })
    })

    const data = await response.json()
    for(const row of data.rows)
    {
      const key = Object.keys(row)
      console.log(key[0]);
    }
    
    setData(data);
  }

  return (
    <>
      <div className="flex flex-col h-full w-full bg-black">
        <TitleBar />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') sendQuery(query);
          }}
          className='bg-gray-900'
        />
        {
          <p className='text-white'>{""}</p>
        }
      </div>
    </>
  )
}

export default App
