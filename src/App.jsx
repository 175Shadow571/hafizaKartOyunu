import { useState, useEffect } from 'react'
import './App.css'
import img_kartArkasi from "./assets/kartArkasi.svg"
import characterGroups from './data/character';


// Shuffle fonksiyonu
function shuffleArray(array) {
  const newArray = [...array]; 
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]]; // swap
  }
  return newArray;
}

function App() {
  
  const localScor = JSON.parse(localStorage.getItem("maxScor"))
  const [maxScor, setMaxScor] = useState(localScor ? localScor : 0)
  const [scor, setScor] = useState(0)
  const [bolum, setBolum] = useState(1)
  const [flipped, setFlipped] = useState(false);
  
  const [fetchedGroups, setFetchedGroups] = useState([]); // Fetch edilmiş gruplar

  const fetchGroup = async (groupIndex) => {
    if (groupIndex >= characterGroups.length) return;

    const group = characterGroups[groupIndex];

    const results = await Promise.all(
      group.map(async (char) => {

        const res = await fetch(`http://localhost:5000/api/character/${char.id}/image`);
        const data = await res.json();                
        return { name: char.name, image: data , isClick: false};
      })
    );

    setFetchedGroups((prev) => [...prev, results]);
  };
  
  useEffect(()=>{
    characterGroups.forEach((_,i) => {
      fetchGroup(i)
    });
  },[])

  


  function imgClick(isClick,name){
    if(flipped) return
    setFlipped(true)

    setTimeout(() =>{
      if(!isClick){
        setScor(prev =>{
          const newScor = prev +1
          if(newScor > maxScor) {
            setMaxScor(newScor)
            localStorage.setItem("maxScor", JSON.stringify(newScor))
          }

          return newScor
        })


        setFetchedGroups(prev => {
          const yeniGruplar = [...prev]; // önce tüm grupları kopyala
          yeniGruplar[bolum -1] = yeniGruplar[bolum -1].map(veri =>
            veri.name === name ? { ...veri, isClick: true } : veri
          );
          yeniGruplar[bolum -1] = shuffleArray(yeniGruplar[bolum -1])

          // Bölüm bittimi kontrolu
          const bolumBittimi = yeniGruplar[bolum -1].every(veri => veri.isClick === true)
          if(bolumBittimi) setBolum(bolum +1)


          return yeniGruplar;
        });

      }else{
        setScor(0)
        setFetchedGroups(prev =>{
          const yeniGruplar = prev.map(grup =>
            grup.map(veri => ({...veri, isClick: false}))
          )

          return yeniGruplar
        })
        setBolum(1)
      }
    }, 300)

  }




  return (
    <>

    <div>
      { fetchedGroups.length > 0 ?
      <div
      style={{display: "grid", gridTemplateColumns: "1fr 150px"}}>
        <div>
          <h1>Nasıl oynanır:</h1>
          <p>Oyun toplam 7 bölümden oluşmaktadır her bölümde 10 karakter vardır ve her birini tek kez tıklamayla bulmanız lazım bir karaktere 2 kez tıklarsanız oyun başa döner.</p>
        </div>
        <div
        style={{
          alignSelf: "end"
        }}
        >
          <p>scor: {scor}</p>
          <p>max skor: {maxScor}</p> 
        </div>
        
        <div style={{gridColumnStart: "1", gridColumnEnd: "3" }}>

            <div style={{ marginBottom: "30px" }}>
              <h2>Bölüm {bolum}</h2>
              <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "15px" }}>
                {fetchedGroups[bolum -1].map((char, idx) => (
                  <div key={idx}>
                    <div className='card'
                    style={{
                      transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                      background: "#647fa7",
                      display: "flex",
                      justifyContent: "center"
                    }}
                    onTransitionEnd={()=> setFlipped(false)}
                    >
                    
                      {
                        !char.image &&
                        <img 
                        className='cardFront'
                        src={char.image} 
                        alt={char.name} 
                        width={120} 
                        onClick={()=>imgClick(char.isClick, char.name)}
                        />
                      }
                      {
                        char.image &&
                        <p
                        onClick={()=>imgClick(char.isClick, char.name)}
                        >{char.name}</p>
                      }
                      
                      <img 
                      className='cardBack'
                      src={img_kartArkasi} 
                      alt="" 
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

        </div>
      </div>
      : <h1>Yükleniyor...</h1>
      }
    </div>

    </>
  )
}

export default App
