import React from 'react';
import pic1 from './img/per.jpeg'
import pic2 from './img/bui.jpeg'
import './styles/About.css'

export default function About() {
  return (
    <>
      <div className="about row">
        <div className="col-lg-12">
          <h2>Welcome to Synapse</h2>
          <p>It's a free music streaming web-app built by <a className='special-url' href='https://shivendrra.vercel.app/' target='blank'>Shivendra</a> as project during <em><a href="https://buildspace.so/nw" className="special-url" target='blank'>nights&weekends</a></em>'s s5 by <a className="special-url" href="https://buildspace.so/" target='blank'>buildspace.</a></p>
          <img src={pic2} className='img-fluid' alt="..." />
          <p>Motivation behind building this was that I was fedup of Spotify & Youtube playing annoying ads after each song & videos, so I decided to built a service that would allow users to stream music for free without any ads or any interruptions.</p>
          <br />
          <hr style={{ width: '50%', margin: 'auto' }} />
          <br />
          <h5><em>Worried how artists are paid?</em></h5>
          <p>This app uses Youtube's V3 API for fetching songs, search & other features, which means it would add a view to each video each time it's fetched using this api. And hence Youtube would pay them
            as they would have paid them for each view on their app.
          </p>
          <img src={pic1} className='img-fluid' alt="..." />
        </div>
      </div>
    </>
  )
}
