import React from 'react'
import ChatWidget from './ChatWidget'
import Hero from './Hero'
import ProductCard from './ProductCard'
import DownloadSection from './DownloadSection'
import EnquiryForm from './EnquiryForm'
import Navbar from './Navbar'

const Home = () => {
  return (
    <div className='p-3 md:p-0'>
      <Navbar />
      <Hero />
      <ProductCard />
      <ChatWidget />
      <EnquiryForm />
    </div>
  )
}

export default Home




// import { useEffect } from "react";
// import { supabase } from "./supabase/supabaseConnection";

// const Home = () => {

//   useEffect(() => {
//     const testSupabase = async () => {
//       console.log("URL:", import.meta.env.VITE_SUPABASE_URL);

//       const { data, error } = await supabase
//         .from("shuhaib")
//         .select("*");

//       console.log("DATA:", data);
//       console.log("ERROR:", error);
//     };

//     testSupabase();
//   }, []);

//   return <div>Home</div>;
// };

// export default Home;