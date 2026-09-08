#!/usr/bin/env python3
import csv, re, sys, time, json, os
from urllib.parse import urljoin
from concurrent.futures import ThreadPoolExecutor, as_completed
import requests
from bs4 import BeautifulSoup

UA = "Mozilla/5.0 (compatible; RZD-ESR-reference-builder/1.0; +https://github.com/konnikita683-collab)"
session = requests.Session()
session.headers.update({"User-Agent": UA})

def get(url, tries=3, timeout=30):
    last=None
    for i in range(tries):
        try:
            r=session.get(url,timeout=timeout)
            if r.status_code==200:
                return r
            last=RuntimeError(f"{url} HTTP {r.status_code}")
        except Exception as e:
            last=e
        time.sleep(0.6*(i+1))
    raise last

def clean(s):
    return re.sub(r"\s+"," ",s or "").strip()

def scrape_raillogistic():
    rows=[]
    # 50 rows/page, current site reports 12 376; discover final page from count.
    first=get("https://raillogistic.ru/stations.php").text
    m=re.search(r"Найдено:\s*([\d\s]+)", BeautifulSoup(first,"lxml").get_text(" ",strip=True))
    total=int(re.sub(r"\D","",m.group(1))) if m else 12376
    pages=(total+49)//50
    def one(page):
        html = first if page==1 else get(f"https://raillogistic.ru/stations.php?page={page}").text
        soup=BeautifulSoup(html,"lxml")
        out=[]
        for tr in soup.select("table tr"):
            cells=[clean(td.get_text(" ",strip=True)) for td in tr.find_all(["td","th"])]
            if len(cells)<5: continue
            code=re.sub(r"\D","",cells[0])
            if not (5 <= len(code) <= 6): continue
            if len(code)==5: code=code.zfill(6)
            name=cells[1]
            typ=cells[2] if len(cells)>2 else ""
            road=cells[3] if len(cells)>3 else ""
            geo_region=cells[4] if len(cells)>4 else ""
            coords=cells[5] if len(cells)>5 else ""
            lat=lon=""
            mm=re.search(r"(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)",coords)
            if mm: lat,lon=mm.group(1),mm.group(2)
            out.append([code,name,typ,road,geo_region,lat,lon,f"https://raillogistic.ru/stations.php?page={page}"])
        return page,out
    with ThreadPoolExecutor(max_workers=12) as ex:
        futs={ex.submit(one,p):p for p in range(1,pages+1)}
        got={}
        for f in as_completed(futs):
            p,out=f.result(); got[p]=out
            if p%25==0: print("RailLogistic page",p,file=sys.stderr)
    for p in range(1,pages+1): rows.extend(got.get(p,[]))
    ded={}
    for r in rows: ded[r[0]]=r
    return total, list(ded.values())

def discover_sitemap_urls(base):
    urls=set()
    cand=[urljoin(base,"robots.txt"),urljoin(base,"sitemap.xml")]
    sitemaps=set()
    for u in cand:
        try:
            txt=get(u).text
        except: continue
        if u.endswith("robots.txt"):
            for line in txt.splitlines():
                if line.lower().startswith("sitemap:"):
                    sitemaps.add(line.split(":",1)[1].strip())
        else: sitemaps.add(u)
    seen=set()
    while sitemaps:
        u=sitemaps.pop()
        if u in seen: continue
        seen.add(u)
        try: txt=get(u).text
        except: continue
        soup=BeautifulSoup(txt,"xml")
        locs=[x.get_text(strip=True) for x in soup.find_all("loc")]
        for loc in locs:
            if "sitemap" in loc.lower() and loc not in seen:
                sitemaps.add(loc)
            else:
                urls.add(loc)
        if len(seen)>100: break
    return urls

def parse_railwayz_station(url):
    try:
        r=get(url,tries=2,timeout=20)
    except Exception:
        return None
    soup=BeautifulSoup(r.text,"lxml")
    text=soup.get_text("\n",strip=True)
    # Country + RZD only
    if "Страна: Россия" not in text or 'ОАО "РЖД"' not in text:
        return None
    mcode=re.search(r"Код ЕСР \(Единая сетевая разметка\):\s*(\d{5,6})",text)
    if not mcode: return None
    code=mcode.group(1).zfill(6)
    h=soup.find("h1")
    name=clean(h.get_text(" ",strip=True)) if h else ""
    name=re.sub(r"^(Железнодорожная\s+)?(станция|разъезд|о\.п\.|остановочный пункт|путевой пост)\s+","",name,flags=re.I)
    # line after country usually "Road, Region"
    road=region=""
    mt=re.search(r"Страна:\s*Россия\s*([^\n]+железная дорога),\s*([^\n]+?регион)",text,re.I)
    if not mt:
        mt=re.search(r'ОАО "РЖД".{0,80}/\s*([^,\n]+железная дорога),\s*([^\n]+?регион)',text,re.I|re.S)
    if mt:
        road=clean(mt.group(1)); region=clean(mt.group(2))
        region=re.sub(r"\s+регион$","",region,flags=re.I)
    coords_lat=coords_lon=""
    mc=re.search(r"Географические координаты[^:]*:\s*([0-9.]+).*?([0-9.]+)",text,re.S)
    if mc: coords_lat,coords_lon=mc.group(1),mc.group(2)
    typ=""
    title=clean(soup.title.get_text(" ",strip=True)) if soup.title else ""
    lo=(h.get_text(" ",strip=True) if h else title).lower()
    if "останов" in lo or "о.п." in lo: typ="остановочный пункт"
    elif "разъезд" in lo: typ="разъезд"
    elif "пост" in lo: typ="пост"
    elif "станц" in lo: typ="станция"
    return [code,name,typ,road,region,coords_lat,coords_lon,url]

def scrape_railwayz():
    urls=discover_sitemap_urls("https://railwayz.info/")
    st=[u for u in urls if re.search(r"/photolines/station/\d+/?$",u)]
    print("Railwayz station URLs from sitemap:",len(st),file=sys.stderr)
    # Fallback / supplement: discover IDs from line pages in sitemap
    line_urls=[u for u in urls if re.search(r"/photolines/line/\d+/?$",u)]
    if line_urls and len(st)<1000:
        for u in line_urls[:5000]:
            try: html=get(u,tries=2,timeout=20).text
            except: continue
            for m in re.finditer(r'href=["\'](/photolines/station/\d+)',html):
                st.append(urljoin("https://railwayz.info",m.group(1)))
        st=sorted(set(st))
    # Last fallback: ID scan with HEAD-ish GET only if sitemap unusable.
    if len(st)<1000:
        st=[f"https://railwayz.info/photolines/station/{i}" for i in range(1,12001)]
        print("Railwayz fallback ID scan",len(st),file=sys.stderr)
    rows=[]
    with ThreadPoolExecutor(max_workers=20) as ex:
        futs=[ex.submit(parse_railwayz_station,u) for u in st]
        for i,f in enumerate(as_completed(futs),1):
            r=f.result()
            if r: rows.append(r)
            if i%1000==0: print("Railwayz checked",i,"found",len(rows),file=sys.stderr)
    ded={}
    for r in rows:
        if r[0] not in ded or (r[4] and not ded[r[0]][4]): ded[r[0]]=r
    return list(ded.values())

def scrape_osm_neighbors(outdir):
    for url in ["https://osm.sbin.ru/esr/neighb.csv","http://osm.sbin.ru/esr/neighb.csv"]:
        try:
            r=get(url,tries=2,timeout=30)
            if "," in r.text and len(r.text)>1000:
                open(os.path.join(outdir,"osm_neighb.csv"),"w",encoding="utf-8").write(r.text)
                return url,len(r.text)
        except: pass
    return "",0

def write_csv(path, headers, rows):
    with open(path,"w",newline="",encoding="utf-8-sig") as f:
        w=csv.writer(f); w.writerow(headers); w.writerows(rows)

def main():
    outdir=os.environ.get("OUTDIR","out")
    os.makedirs(outdir,exist_ok=True)
    total,rl=scrape_raillogistic()
    write_csv(os.path.join(outdir,"raillogistic.csv"),
              ["esr","name","type","road","rf_region","lat","lon","source"],rl)
    rw=scrape_railwayz()
    write_csv(os.path.join(outdir,"railwayz.csv"),
              ["esr","name","type","road","rzd_region","lat","lon","source"],rw)
    osm_url,osm_bytes=scrape_osm_neighbors(outdir)
    report={"raillogistic_reported":total,"raillogistic_unique":len(rl),
            "railwayz_rzd_unique":len(rw),"osm_neighbors_url":osm_url,"osm_neighbors_bytes":osm_bytes}
    open(os.path.join(outdir,"report.json"),"w",encoding="utf-8").write(json.dumps(report,ensure_ascii=False,indent=2))
    print(json.dumps(report,ensure_ascii=False))

if __name__=="__main__":
    main()
