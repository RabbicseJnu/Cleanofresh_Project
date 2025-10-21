import { useState } from "react";
import cleanerImg from "../assets/Web-pic.png";

type TabKey = "provide" | "works" | "withus";

export default function AboutCompany() {
  const [tab, setTab] = useState<TabKey>("provide");

  return (
    <section className="about-sec">
      <div className="container">
        <h2 className="about-title">About Our Company</h2>

        <div className="about-tabs" role="tablist" aria-label="About company tabs">
          <button role="tab" aria-selected={tab === "provide"} className={"tab" + (tab === "provide" ? " active" : "")} onClick={() => setTab("provide")}>We Provide</button>
          <span className="sep">|</span>
          <button role="tab" aria-selected={tab === "works"} className={"tab" + (tab === "works" ? " active" : "")} onClick={() => setTab("works")}>How it Works</button>
          <span className="sep">|</span>
          <button role="tab" aria-selected={tab === "withus"} className={"tab" + (tab === "withus" ? " active" : "")} onClick={() => setTab("withus")}>With Us</button>
        </div>

        <div className="about-row">
          <div className="about-left">
            {tab === "provide" && <ProvideTab />}
            {tab === "works" && <WorksTab />}
            {tab === "withus" && <WithUsTab />}
          </div>

          <div className="about-right">
            <img src={cleanerImg} alt="Cleaner with bucket" />
          </div>
        </div>
      </div>
    </section>
  );
}

/* --- Tab panes --- */

function ProvideTab() {
  return (
    <section className="provide-sec">
      <p className="about-lead">
        Cleaning can be a chore and we know you have many choices when you consider hiring a maid service.
        Because of that, we are constantly thriving to improve our already high standards to have you see us
        as the absolute best in the industry. It’s not enough to have trust in the cleaning crew that you let
        into your home… you also have to trust that they will perform a first-class cleaning job for you.
      </p>

      <h4 className="about-subtitle provide-title">We Provide</h4>
      <div className="tick-grid provide-grid">
        <ul className="tick-list provide-list">
          <li><span className="tick" /> One-off, weekly or fortnightly visits</li>
          <li><span className="tick" /> Vetted &amp; background-checked cleaners</li>
          <li><span className="tick" /> Online booking and payment</li>
        </ul>
        <ul className="tick-list provide-list">
          <li><span className="tick" /> Keep the same cleaner for every visit</li>
          <li><span className="tick" /> All cleaning materials and equipment</li>
          <li><span className="tick" /> 100% satisfaction guarantee</li>
        </ul>
      </div>
    </section>
  );
}

function WorksTab() {
  return (
    <div className="works-grid">
      <div>
        <h4 className="about-subtitle works-title">How Cleaning Company Works</h4>
        <p>
          When the weekend finally arrives, you’d much rather put your feet up while a cleaning service does the
          work, rather than spend your precious downtime on your hands and knees scrubbing.
        </p>
        <p>
          Taking the stress out of any aspect of cleaning is what we specialise in. We will come to your premises
          and offer a free quote, so you know exactly what you’ll be spending.
        </p>
      </div>

      <div className="work-item-list">
        <div className="work-item">
          <div className="head">Book online in <a className="accent" href="#!">60 seconds</a></div>
          <p>Book &amp; pay online. We’ll match you with a trusted, experienced house cleaner.</p>
        </div>

        <div className="work-item">
          <div className="head">Get a <a className="accent" href="#!">5 star cleaner</a></div>
          <p>Every cleaner is friendly and reliable. They’ve been background-checked &amp; rated 5-stars.</p>
        </div>

        <div className="work-item">
          <div className="head">Manage everything <a className="accent" href="#!">online</a></div>
          <p>Add visits, skip visits, leave notes, and book extra services—laundry and oven cleaning.</p>
        </div>
      </div>
    </div>
  );
}

function WithUsTab() {
  return (
    <div className="withus-grid">
      <div className="withus-item">
        <div className="num">1.</div>
        <div>
          <h5>We Treat Your Homes Like Ours</h5>
          <p>We’re fully bonded and insured, meaning you can have peace of mind when we enter your home.</p>
        </div>
      </div>

      <div className="withus-item">
        <div className="num">2.</div>
        <div>
          <h5>Satisfaction Guaranteed</h5>
          <p>If you’re ever unhappy with any area we’ve cleaned, we’ll come back and reclean it next day.</p>
        </div>
      </div>

      <div className="withus-item">
        <div className="num">3.</div>
        <div>
          <h5>Immediate Online Quotes</h5>
          <p>Get an immediate price quote so you can enjoy your time rather than worry about the mess.</p>
        </div>
      </div>

      <div className="withus-item">
        <div className="num">4.</div>
        <div>
          <h5>We Are Experts</h5>
          <p>We have an adaptable, extensive network that consistently delivers exceptional results.</p>
        </div>
      </div>
    </div>
  );
}
