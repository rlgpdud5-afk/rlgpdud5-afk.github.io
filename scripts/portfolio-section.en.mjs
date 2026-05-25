/** Full EN portfolio block — swapped in before partial mvpRepl (avoids 상/중/원 substring corruption). */
export const PORTFOLIO_SECTION_EN = `// ─── Portfolio templates & AI tailor (demo) ───
const PORT_TEMPLATES = [
  {k:"project",name:"Project showcase",desc:"Behance/Notion-style case study. Visual project cards first.",mini:"port-tpl-mini--project"},
  {k:"resume",name:"Job application",desc:"One-page resume (JobKorea/Wanted style). Photo, summary, experience bullets.",mini:"port-tpl-mini--resume"},
  {k:"career",name:"Career narrative",desc:"Formal career summary for public sector / enterprise. Tables for role, outcomes, verification.",mini:"port-tpl-mini--career"},
  {k:"proposal",name:"Proposal",desc:"Freelance / B2B proposal: scope, timeline, verified track record, estimate.",mini:"port-tpl-mini--proposal"},
];
const MOCK_APPLY_JOBS = [
  {id:"j1",company:"LocalTech Inc.",title:"Frontend developer (React)",keywords:["React","HTML/CSS","Components","Responsive"],summary:"Lead with local-commerce redesign product UI and responsive delivery; emphasize React publishing skills.",reorder:["c-demo","c1","c2"],emphasis:"Frontend · UI delivery"},
  {id:"j2",company:"EduPlus",title:"UX research · planning support",keywords:["UX research","Interviews","User research","Analysis"],summary:"Move EdTech UX research and interview synthesis to the top; rewrite qualitative/quantitative analysis bullets to match the JD.",reorder:["c3","c2","c1"],emphasis:"UX research · user insights"},
  {id:"j3",company:"Sejong City Hall",title:"Data cleanup · visualization intern",keywords:["Data analysis","Excel","Research","Reporting"],summary:"Highlight marketing research and survey analysis projects; stress public-data cleanup and report writing fit.",reorder:["c2","c3","c1"],emphasis:"Data · research"},
];

function PortDocProject({user,creds}) {
  return (
    <div className="port-doc port-doc--project">
      <div className="port-doc-inner">
        <div className="pd-hero">
          <div style={{fontSize:10,letterSpacing:2,color:"var(--accent-warm)",marginBottom:8}}>PROJECT PORTFOLIO</div>
          <div style={{fontSize:26,fontWeight:800,marginBottom:8}}>{user.name}</div>
          <div style={{fontSize:13,color:"rgba(232,234,239,.65)",maxWidth:420}}>Verified LER work portfolio · {user.region} · Trust {user.trustScore}</div>
          <div style={{display:"flex",gap:8,marginTop:16,flexWrap:"wrap"}}>{user.skills.map(s=><span key={s} style={{fontSize:11,padding:"4px 10px",borderRadius:6,background:"rgba(212,165,116,.2)",color:"#E8D5B5"}}>{s}</span>)}</div>
        </div>
        <div className="pd-grid">
          {creds.map(c=>(
            <div key={c.id} className="pd-card">
              <div style={{fontSize:10,color:"var(--accent-warm)",marginBottom:6}}>CASE · {c.verifyId}</div>
              <div style={{fontSize:15,fontWeight:700,marginBottom:6}}>{c.project}</div>
              <div style={{fontSize:12,color:"rgba(255,255,255,.55)",marginBottom:10}}>{c.task}</div>
              <div style={{height:4,background:"rgba(255,255,255,.08)",borderRadius:2,marginBottom:10}}><div style={{width:\`\${c.rating*20}%\`,height:"100%",background:"var(--accent-warm)",borderRadius:2}}/></div>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:11}}><Stars v={c.rating}/><span style={{color:"var(--success)"}}>QA Pass</span></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PortDocResume({user,creds}) {
  return (
    <div className="port-doc port-doc--resume">
      <div className="port-doc-inner pd-split">
        <div className="pd-side">
          <div className="pd-photo">{user.name[0]}</div>
          <div style={{fontSize:16,fontWeight:700,marginBottom:4}}>{user.name}</div>
          <div style={{fontSize:11,opacity:.75,marginBottom:20}}>Talent · {user.region}</div>
          <div style={{fontSize:10,textTransform:"uppercase",letterSpacing:1,opacity:.6,marginBottom:8}}>Contact</div>
          <div style={{fontSize:11,marginBottom:16}}>demo@localcrew.kr<br/>Verified LER</div>
          <div style={{fontSize:10,textTransform:"uppercase",letterSpacing:1,opacity:.6,marginBottom:8}}>Skills</div>
          {user.skills.map(s=><div key={s} style={{fontSize:11,marginBottom:4}}>· {s}</div>)}
          <div style={{marginTop:20,fontSize:10,opacity:.6}}>Trust {user.trustScore} · On-time {user.deadlineRate}%</div>
        </div>
        <div className="pd-main">
          <div style={{fontSize:11,color:"#666",marginBottom:4}}>Motivation / summary</div>
          <p style={{marginBottom:20,color:"#333"}}>Based on LER-verified project work, completed <b>{creds[0]?.project}</b> and {user.completedProjects} other engagements. Collaboration and on-time rate {user.deadlineRate}%.</p>
          <div style={{fontSize:12,fontWeight:800,borderBottom:"2px solid #1a1d24",paddingBottom:6,marginBottom:12}}>Experience · projects</div>
          {creds.map(c=>(
            <div key={c.id} style={{marginBottom:16}}>
              <div style={{display:"flex",justifyContent:"space-between"}}><b>{c.project}</b><span style={{color:"#666",fontSize:11}}>{c.period}</span></div>
              <div style={{color:"#444",fontSize:12,margin:"4px 0 6px"}}>{c.task} · {c.role}</div>
              <ul style={{margin:0,paddingLeft:18,color:"#333",fontSize:12}}>
                <li>Delivered assigned work; passed reviewer QA (VRF {c.verifyId})</li>
                <li>Core skills: {c.skills.join(", ")} · Rating {c.rating}</li>
              </ul>
            </div>
          ))}
          <div style={{fontSize:12,fontWeight:800,borderBottom:"2px solid #1a1d24",paddingBottom:6,marginTop:8,marginBottom:8}}>Education · other</div>
          <div style={{fontSize:12,color:"#444"}}>○○ University, Computer Science (in progress / graduated) · LocalCrew Talent Program</div>
        </div>
      </div>
    </div>
  );
}

function PortDocCareer({user,creds}) {
  return (
    <div className="port-doc port-doc--career">
      <div className="port-doc-inner">
        <div style={{textAlign:"center",marginBottom:24}}>
          <div style={{fontSize:20,fontWeight:800}}>CAREER SUMMARY</div>
          <div style={{fontSize:14,marginTop:8}}>Name: {user.name} &nbsp;&nbsp; Date: 2026.03.24</div>
        </div>
        <table><tbody>
          <tr><th style={{width:100}}>Name</th><td>{user.name}</td><th style={{width:80}}>Region</th><td>{user.region}</td></tr>
          <tr><th>Core skills</th><td colSpan={3}>{user.skills.join(" · ")}</td></tr>
          <tr><th>Trust metrics</th><td colSpan={3}>Trust {user.trustScore} · On-time {user.deadlineRate}% · Avg rating {user.avgRating} (LER verified)</td></tr>
        </tbody></table>
        <div style={{fontWeight:700,margin:"20px 0 8px"}}>1. Experience summary</div>
        <table><thead><tr><th>Period</th><th>Project / org</th><th>Role & tasks</th><th>Outcomes · verification</th></tr></thead>
        <tbody>{creds.map(c=>(
          <tr key={c.id}>
            <td>{c.period}</td>
            <td>{c.project}</td>
            <td>{c.task}<br/><span style={{fontSize:11,color:"#555"}}>{c.skills.join(", ")}</span></td>
            <td>Rating {c.rating} · {c.verifyId}<br/>{c.qaPass?"QA passed":"—"}</td>
          </tr>
        ))}</tbody></table>
        <div style={{fontWeight:700,margin:"16px 0 8px"}}>2. Introduction (work-focused)</div>
        <p style={{margin:0,textAlign:"justify"}}>Completed {user.completedProjects} assignments via regional project platform LocalCrew; all records verified as Learning & Employment Records (LER). Strengths: clear communication and deadline adherence.</p>
      </div>
    </div>
  );
}

function PortDocProposal({user,creds}) {
  const total = creds.length * 850000;
  return (
    <div className="port-doc port-doc--proposal">
      <div className="port-doc-inner">
        <div className="pp-cover">
          <div style={{fontSize:11,color:"#666",letterSpacing:2}}>PROJECT PROPOSAL</div>
          <div style={{fontSize:22,fontWeight:800,marginTop:8}}>Talent proposal — {user.name}</div>
          <div style={{fontSize:13,color:"#444",marginTop:8}}>For: project clients · LocalCrew verified talent</div>
        </div>
        <div className="pp-sec"><h4>1. Overview</h4><p>This proposal recommends LER-verified talent {user.name}. Trust {user.trustScore}, {user.completedProjects} projects completed.</p></div>
        <div className="pp-sec"><h4>2. Verified delivery history</h4>
          {creds.map(c=><div key={c.id} style={{marginBottom:10,paddingLeft:12,borderLeft:"3px solid #D4A574"}}><b>{c.project}</b> — {c.task} ({c.period})<br/><span style={{fontSize:12,color:"#555"}}>Verify ID {c.verifyId} · {c.skills.join(", ")}</span></div>)}
        </div>
        <div className="pp-sec"><h4>3. Schedule · deliverables</h4>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}><thead><tr style={{background:"#f0ede8"}}><th style={{border:"1px solid #ccc",padding:8}}>Phase</th><th style={{border:"1px solid #ccc",padding:8}}>Duration</th><th style={{border:"1px solid #ccc",padding:8}}>Deliverable</th></tr></thead>
          <tbody><tr><td style={{border:"1px solid #ccc",padding:8}}>Kickoff</td><td style={{border:"1px solid #ccc",padding:8}}>1 week</td><td style={{border:"1px solid #ccc",padding:8}}>Scope document</td></tr>
          <tr><td style={{border:"1px solid #ccc",padding:8}}>Execution</td><td style={{border:"1px solid #ccc",padding:8}}>3–4 weeks</td><td style={{border:"1px solid #ccc",padding:8}}>Draft & final outputs</td></tr>
          <tr><td style={{border:"1px solid #ccc",padding:8}}>Review · LER</td><td style={{border:"1px solid #ccc",padding:8}}>1 week</td><td style={{border:"1px solid #ccc",padding:8}}>Reviewer approval · VRF issued</td></tr></tbody></table>
        </div>
        <div className="pp-sec"><h4>4. Fee (reference)</h4><p style={{fontSize:18,fontWeight:700}}>₩ {total.toLocaleString()} <span style={{fontSize:12,fontWeight:400,color:"#666"}}>(VAT excluded · demo estimate)</span></p></div>
      </div>
    </div>
  );
}

function PortPreview({tpl,user,creds}) {
  if(tpl==="resume") return <PortDocResume user={user} creds={creds}/>;
  if(tpl==="career") return <PortDocCareer user={user} creds={creds}/>;
  if(tpl==="proposal") return <PortDocProposal user={user} creds={creds}/>;
  return <PortDocProject user={user} creds={creds}/>;
}

function Portfolio({user}) {
  const [tab,setTab]=useState("builder");
  const [tpl,setTpl]=useState("project");
  const [sel,setSel]=useState(()=>MOCK_CREDENTIALS.map(c=>c.id));
  const [gen,setGen]=useState(false);
  const [done,setDone]=useState(false);
  const [aiJob,setAiJob]=useState(MOCK_APPLY_JOBS[0].id);
  const [aiGen,setAiGen]=useState(false);
  const [aiDone,setAiDone]=useState(false);

  const toggleCred=(id)=>setSel(prev=>prev.includes(id)?prev.filter(x=>x!==id):[...prev,id]);
  const creds=MOCK_CREDENTIALS.filter(c=>sel.includes(c.id));
  const job=MOCK_APPLY_JOBS.find(j=>j.id===aiJob)||MOCK_APPLY_JOBS[0];
  const aiCreds=[...creds].sort((a,b)=>job.reorder.indexOf(a.id)-job.reorder.indexOf(b.id));

  const go=()=>{setGen(true);setTimeout(()=>{setGen(false);setDone(true)},1400)};
  const goAi=()=>{setAiGen(true);setTimeout(()=>{setAiGen(false);setAiDone(true)},1600)};

  return (<div>
    <div className="ph"><h1>Portfolio · applications</h1><p>Generate format-specific documents from LER data · AI tailoring per job posting (demo)</p></div>
    <div className="pb">
      <div className="port-tabs">
        <button type="button" className={tab==="builder"?"on":""} onClick={()=>setTab("builder")}>Templates by format</button>
        <button type="button" className={tab==="ai"?"on":""} onClick={()=>setTab("ai")}>AI-tailored application</button>
      </div>

      {tab==="builder"&&(
        <div className="port-layout fade-up">
          <div className="port-side">
            <div className="glass" style={{padding:18}}>
              <div className="ct" style={{marginBottom:12}}>Template (layout differs per format)</div>
              <div className="port-tpl-grid">
                {PORT_TEMPLATES.map(t=>(
                  <button key={t.k} type="button" className={"port-tpl-card"+(tpl===t.k?" on":"")} onClick={()=>{setTpl(t.k);setDone(false)}}>
                    <div className={"port-tpl-mini "+t.mini}/>
                    <div className="pt-name">{t.name}</div>
                    <div className="pt-desc">{t.desc}</div>
                  </button>
                ))}
              </div>
            </div>
            <div className="glass" style={{padding:18}}>
              <div className="ct" style={{marginBottom:12}}>LER projects to include</div>
              {MOCK_CREDENTIALS.map(c=>(
                <label key={c.id} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:"1px solid var(--border)",cursor:"pointer"}}>
                  <input type="checkbox" checked={sel.includes(c.id)} onChange={()=>{toggleCred(c.id);setDone(false)}} style={{accentColor:"var(--accent-warm)"}}/>
                  <div style={{flex:1}}><div style={{fontSize:13,fontWeight:550}}>{c.project}</div><div style={{fontSize:11,color:"var(--text-3)"}}>{c.task}</div></div>
                  <Stars v={c.rating}/>
                </label>
              ))}
            </div>
            <button type="button" className="btn btn-p" onClick={go} disabled={gen||!sel.length}>{gen?"Generating…":"Generate preview"}</button>
            {done&&<div style={{display:"flex",gap:8}}><button type="button" className="btn btn-s btn-sm">{I.dl} PDF</button><button type="button" className="btn btn-s btn-sm">{I.link} Share URL</button></div>}
          </div>
          <div className="port-preview-wrap">
            <div className="port-preview-label">
              <span>Live preview · {PORT_TEMPLATES.find(t=>t.k===tpl)?.name}</span>
              {!done&&<span style={{color:"var(--text-3)"}}>Click generate for final render</span>}
            </div>
            {(done||!gen)&&<PortPreview tpl={tpl} user={user} creds={creds.length?creds:MOCK_CREDENTIALS}/>}
            {gen&&<div className="glass" style={{padding:40,textAlign:"center"}}>Mapping LER data…</div>}
          </div>
        </div>
      )}

      {tab==="ai"&&(
        <div className="port-layout fade-up">
          <div className="port-side">
            <div className="glass" style={{padding:18}}>
              <div className="ct" style={{marginBottom:8}}>① Choose a job posting</div>
              <p style={{fontSize:12,color:"var(--text-2)",marginBottom:14,lineHeight:1.6}}>Like GlobalWork or Wanted: <b>each JD</b> changes what to emphasize in the same LER history. (Production: LLM + RAG)</p>
              <div className="port-ai-jobs">
                {MOCK_APPLY_JOBS.map(j=>(
                  <button key={j.id} type="button" className={"port-ai-job"+(aiJob===j.id?" on":"")} onClick={()=>{setAiJob(j.id);setAiDone(false)}}>
                    <div className="aj-co">{j.company}</div>
                    <div className="aj-ti">{j.title}</div>
                  </button>
                ))}
              </div>
            </div>
            <div className="glass" style={{padding:18}}>
              <div className="ct" style={{marginBottom:8}}>② Base format</div>
              <select className="input" value={tpl} onChange={e=>setTpl(e.target.value)} style={{width:"100%"}}>
                {PORT_TEMPLATES.map(t=><option key={t.k} value={t.k}>{t.name}</option>)}
              </select>
            </div>
            <button type="button" className="btn btn-p" style={{background:"linear-gradient(135deg,#7c3aed,#a78bfa)"}} onClick={goAi} disabled={aiGen}>{aiGen?"AI restructuring…":"Generate for this posting"}</button>
            <p style={{fontSize:11,color:"var(--text-3)",lineHeight:1.55}}>Demo: keyword and project order are preset per posting. In production: upload PDF/portfolio + parse JD → LLM writes bullets, order, and summary.</p>
          </div>
          <div>
            {aiDone?(
              <>
                <div className="glass" style={{padding:16,marginBottom:16,border:"1px solid rgba(139,92,246,.35)"}}>
                  <div style={{fontSize:12,color:"#c4b5fd",fontWeight:600,marginBottom:6}}>AI-tailored summary · {job.emphasis}</div>
                  <p style={{fontSize:13,color:"var(--text-2)",margin:0,lineHeight:1.65}}>{job.summary}</p>
                  <div className="port-ai-kw">{job.keywords.map(k=><span key={k}>{k}</span>)}</div>
                </div>
                <div className="port-ai-diff">
                  <div className="port-ai-col">
                    <h5>Default (full LER)</h5>
                    <p>Project order: chronological · equal weight on all skills.</p>
                    <PortPreview tpl={tpl} user={user} creds={creds.length?creds:MOCK_CREDENTIALS}/>
                  </div>
                  <div className="port-ai-col tailored">
                    <h5>AI tailored ({job.company})</h5>
                    <p>JD keywords · relevant projects on top · adjusted bullet tone.</p>
                    <PortPreview tpl={tpl} user={user} creds={aiCreds.length?aiCreds:MOCK_CREDENTIALS}/>
                  </div>
                </div>
              </>
            ):(
              <div className="port-preview-wrap">
                <div className="port-preview-label">Default LER portfolio (before tailoring)</div>
                <PortPreview tpl={tpl} user={user} creds={creds.length?creds:MOCK_CREDENTIALS}/>
                {aiGen&&<div className="glass" style={{padding:24,marginTop:12,textAlign:"center",color:"#c4b5fd"}}>JD analysis → LER match → rewrite simulation…</div>}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  </div>);
}

`;

export function applyPortfolioEn(html) {
  const start = '// ─── Portfolio templates & AI tailor (demo) ───';
  const end = '// ─── Client Dashboard ───';
  const i0 = html.indexOf(start);
  const i1 = html.indexOf(end);
  if (i0 < 0 || i1 < 0) throw new Error('Portfolio section markers not found in localcrew-mvp.html');
  return html.slice(0, i0) + PORTFOLIO_SECTION_EN + html.slice(i1);
}
