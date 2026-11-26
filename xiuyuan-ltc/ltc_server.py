# -*- coding: utf-8 -*-
"""
休元外贸 LTC 系统 · 后端
零依赖：http.server + sqlite3，双击即跑，数据全存本机 ltc.db
"""
import json, os, re, socket, sqlite3, sys, threading, time, webbrowser, csv, io
from datetime import date, datetime, timedelta
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse, parse_qs

BASE = os.path.dirname(os.path.abspath(__file__))
DB = os.path.join(BASE, 'ltc.db')
UI = os.path.join(BASE, 'ltc_ui.html')
PORT0 = 8911

# ============ 字典（全系统唯一来源） ============
COUNTRIES = ['乌兹别克斯坦','哈萨克斯坦','吉尔吉斯斯坦','塔吉克斯坦','土库曼斯坦',
             '阿塞拜疆','俄罗斯','土耳其','阿联酋','沙特','肯尼亚','越南','印尼']
SOURCES = ['中国制造网','阿里国际站','新媒体推广','展会','老客户转介绍',
           '市场开发','独立站','LinkedIn','Facebook','WhatsApp','邮件开发','客户主动询盘']
GRADES = ['A 高意向','B 一般意向','C 弱意向']
LEAD_ST = ['初次联系','持续跟进','转机会点','暂时搁置','无效关闭']
CLOSE_REASONS = ['价格过高','无采购计划','联系不上','找到替代供应商','项目取消','资质不符']
STAGES = ['立项','报价','合同','生产','采购','仓储','发货','回款','完成']
PTYPES = ['成套项目','元器件供货','技术服务','设备改造','备件供应']
CURRS = ['USD','CNY','EUR','UZS','KZT']
FX = {'USD': 1.0, 'CNY': 0.14, 'EUR': 1.08, 'UZS': 0.000080, 'KZT': 0.0021}
INCOTERMS = ['FOB','CIF','CFR','EXW','DAP','DDP','FCA']
PAY_TERMS = ['T/T 30%定金+70%见提单','T/T 100%预付','T/T 30天','L/C 即期','L/C 90天','D/P','O/A 30天','O/A 60天']
QUOTE_ST = ['待发出','已发出','客户接受','客户拒绝','已过期']
CONTRACT_ST = ['待签','执行中','已完成','已终止']
PROD_ST = ['待排产','生产中','已完工','已入库']
PO_ST = ['待下单','已下单','在途','已入库']
OUT_ST = ['待出库','已装箱','已出库']
SHIP_ST = ['待发运','已报关','在途','已到港','已签收']
PAY_ST = ['待确认','部分回款','已结清']
PAY_METHODS = ['T/T 电汇','L/C 信用证','D/P 托收','现金','其他']

# 10 个角色（权限矩阵）
ROLES = [
    {'uname':'张伟',   'en':'',       'dept':'总经理室',          'role':'总经理 / 市场负责人', 'perms':['*']},
    {'uname':'熊丽君', 'en':'June',   'dept':'国贸部',            'role':'国贸部负责人',        'perms':['dash','leads','opps','reviews','projects','flow','quotes','contracts','payments','db-trade','rates']},
    {'uname':'高振永', 'en':'',       'dept':'国贸部',            'role':'外贸技术支持',        'perms':['dash','projects','production','purchases','db-prod','db-mat','rates']},
    {'uname':'王嘉译', 'en':'',       'dept':'新媒体运营·AI中心', 'role':'负责人',              'perms':['dash','leads','db-media']},
    {'uname':'陈可雨', 'en':'Coey',   'dept':'国贸部',            'role':'外贸助理',            'perms':['dash','leads','opps','quotes','contracts']},
    {'uname':'陈雨诗', 'en':'Cici',   'dept':'国贸部',            'role':'外贸行政人事',        'perms':['dash','logs']},
    {'uname':'张茹滟', 'en':'Candy',  'dept':'国贸部',            'role':'中国制造网平台运营',  'perms':['dash','leads','db-made','db-media']},
    {'uname':'崔永越', 'en':'Dmitri', 'dept':'国贸部',            'role':'外贸业务员',          'perms':['dash','leads','opps','quotes','contracts']},
    {'uname':'李艳英', 'en':'',       'dept':'采购部',            'role':'采购',                'perms':['dash','purchases','production','db-prod','db-mat','rates']},
    {'uname':'夏丽珍', 'en':'',       'dept':'财务部',            'role':'财务',                'perms':['dash','payments','contracts','quotes','db-fin','rates']},
]
REVIEW_STEPS = ['业务初评','技术评审','负责人复核','总经理终审']

# ============ 表结构 ============
TABLES = {
 'customers':   ['code','name_en','name_local','country','city','ctype','source','grade','first_contact','owner','tax_no','addr','website','note',
                  'tz','lang','pay_pref','dest_port','credit_limit'],
 'leads':       ['lead_no','source','company','country','city','contact','title','phone','email','whatsapp','demand','category','budget','grade','status','last_follow','next_follow','owner','close_reason','note'],
 'opportunities':['opp_no','lead_id','customer_id','title','country','city','ptype','amount','currency','prob','owner','note'],
 'reviews':     ['review_no','opp_id','step','reviewer','result','comment','rdate'],
 'projects':    ['proj_no','customer_id','title','country','city','amount','currency','owner','sign_date','note'],
 'quotes':      ['quote_no','proj_id','customer_id','amount','currency','qdate','valid_days','incoterm','pay_term','status','note',
                  'rate','rate_ccy','ver','cost','margin'],
 'contracts':   ['contract_no','proj_id','customer_id','name','amount','currency','sign_date','incoterm','pay_term','status','note'],
 'production':  ['prod_no','proj_id','product','spec','qty','unit','progress','plan_start','plan_end','status','note'],
 'purchases':   ['po_no','proj_id','material','spec','qty','unit','supplier','price','currency','odate','status','note'],
 'outbounds':   ['out_no','proj_id','detail','boxes','odate','status','note'],
 'shipments':   ['ship_no','proj_id','dest','transport','bl_no','etd','eta','status','note',
                  'ctn_no','ctn_type','freight_fwd','docs'],
 'payments':    ['pay_no','proj_id','customer_id','amount','currency','pdate','method','status','note',
                  'due_date','invoice_no'],
 'products':    ['code','name','category','spec','unit','price','currency','stock','stock_min','note'],
 'suppliers':   ['code','name','category','contact','phone','email','addr','note'],
 'rates':       ['pair','rate','rdate','note'],
}
NUMERIC = {'amount','qty','price','stock','stock_min','progress','boxes','prob','valid_days',
           'rate','cost','margin','credit_limit'}
MONEY = {'amount','price'}
DATE_F = {'first_contact','last_follow','next_follow','qdate','sign_date','plan_start','plan_end',
          'odate','etd','eta','pdate','rdate'}
AUTO = {'customers':'code','leads':'lead_no','opportunities':'opp_no','reviews':'review_no',
        'projects':'proj_no','quotes':'quote_no','contracts':'contract_no','production':'prod_no',
        'purchases':'po_no','outbounds':'out_no','shipments':'ship_no','payments':'pay_no',
        'products':'code','suppliers':'code'}
PREFIX = {'customers':'C','leads':'XL','opportunities':'JD','reviews':'PS','projects':'XM',
          'quotes':'BJ','contracts':'HT','production':'SC','purchases':'CG','outbounds':'CK',
          'shipments':'FH','payments':'HK','products':'P','suppliers':'GYS'}
CHILD = {  # 父表 -> (子表, 外键, 中文名)
  'customers': [('opportunities','customer_id','机会点'),('projects','customer_id','项目'),
                ('quotes','customer_id','报价'),('contracts','customer_id','合同'),
                ('payments','customer_id','回款')],
  'leads': [('opportunities','lead_id','机会点')],
  'projects': [('quotes','proj_id','报价'),('contracts','proj_id','合同'),('production','proj_id','生产'),
               ('purchases','proj_id','采购'),('outbounds','proj_id','出库'),('shipments','proj_id','发货'),
               ('payments','proj_id','回款')],
  'opportunities': [('reviews','opp_id','评审')],
}

def today():
    return date.today().isoformat()

def nowstr():
    return datetime.now().strftime('%Y-%m-%d %H:%M')

def usd(amount, cur):
    try:
        return round(float(amount or 0) * FX.get(cur or 'USD', 1.0), 2)
    except Exception:
        return 0.0

# ============ 数据库 ============
def conn():
    c = sqlite3.connect(DB, timeout=15)
    c.row_factory = sqlite3.Row
    c.execute('PRAGMA foreign_keys=ON')
    return c

def migrate(c):
    for t, fs in TABLES.items():
        try:
            have = set(r[1] for r in c.execute('PRAGMA table_info(%s)' % t).fetchall())
        except Exception:
            continue
        for f in fs:
            if f not in have:
                try:
                    c.execute('ALTER TABLE %s ADD COLUMN %s TEXT' % (t, f))
                except Exception as e:
                    print('migrate skip %s.%s: %s' % (t, f, e))

def init():
    try:
        c.execute('PRAGMA journal_mode=WAL')
        c.execute('PRAGMA busy_timeout=20000')
    except Exception:
        pass
    c = conn()
    for t, fs in TABLES.items():
        cols = ['id INTEGER PRIMARY KEY AUTOINCREMENT']
        for f in fs:
            cols.append('%s TEXT' % f)
        cols.append("created TEXT")
        cols.append("updated TEXT")
        c.execute('CREATE TABLE IF NOT EXISTS %s (%s)' % (t, ','.join(cols)))
    c.execute('''CREATE TABLE IF NOT EXISTS logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ts TEXT, user TEXT, action TEXT, target TEXT, detail TEXT)''')
    c.execute('''CREATE TABLE IF NOT EXISTS settings (k TEXT PRIMARY KEY, v TEXT)''')
    migrate(c)
    c.commit()
    c.close()

def next_no(c, tbl):
    """生成单据号：前缀-YYYYMMDD-NNN"""
    pre = PREFIX[tbl]
    d = date.today().strftime('%Y%m%d')
    fld = AUTO[tbl]
    row = c.execute('SELECT COUNT(*) n FROM %s' % tbl).fetchone()
    n = (row['n'] or 0) + 1
    while True:
        no = '%s-%s-%03d' % (pre, d, n)
        ex = c.execute('SELECT 1 FROM %s WHERE %s=?' % (tbl, fld), (no,)).fetchone()
        if not ex:
            return no
        n += 1

def log(c, user, action, target, detail):
    c.execute('INSERT INTO logs(ts,user,action,target,detail) VALUES(?,?,?,?,?)',
              (nowstr(), user or '系统', action, target, detail))

# ============ 业务计算（全系统唯一口径） ============
def project_finance(c, pid):
    """项目财务：合同额 / 已回款 / 应收余额 / 回款率，全部 USD"""
    ct = c.execute('SELECT COALESCE(SUM(CAST(amount AS REAL)),0) a, currency cur FROM contracts WHERE proj_id=? AND status!="已终止"', (pid,)).fetchone()
    contract_usd = 0.0
    rows = c.execute('SELECT amount,currency FROM contracts WHERE proj_id=? AND status!="已终止"', (pid,)).fetchall()
    for r in rows:
        contract_usd += usd(r['amount'], r['currency'])
    pays = c.execute('SELECT amount,currency FROM payments WHERE proj_id=? AND status!="待确认"', (pid,)).fetchall()
    paid_usd = sum(usd(r['amount'], r['currency']) for r in pays)
    return {
        'contract_usd': round(contract_usd, 2),
        'paid_usd': round(paid_usd, 2),
        'due_usd': round(contract_usd - paid_usd, 2),
        'rate': round(paid_usd / contract_usd * 100, 1) if contract_usd > 0 else 0.0,
    }

def project_stage(c, pid):
    """阶段由单据自动推进 —— 人不填，系统算"""
    def has(tbl, cond=''):
        r = c.execute('SELECT COUNT(*) n FROM %s WHERE proj_id=? %s' % (tbl, cond), (pid,)).fetchone()
        return (r['n'] or 0) > 0
    fin = project_finance(c, pid)
    if fin['contract_usd'] > 0 and fin['due_usd'] <= 0.01 and fin['paid_usd'] > 0:
        return '完成'
    if has('payments', "AND status!='待确认'"):
        return '回款'
    if has('shipments', "AND status IN ('已报关','在途','已到港','已签收')"):
        return '发货'
    if has('outbounds'):
        return '仓储'
    if has('purchases'):
        return '采购'
    if has('production'):
        return '生产'
    if has('contracts', "AND status!='已终止'"):
        return '合同'
    if has('quotes'):
        return '报价'
    return '立项'

def lead_status_auto(c, lid):
    r = c.execute('SELECT COUNT(*) n FROM opportunities WHERE lead_id=?', (lid,)).fetchone()
    if (r['n'] or 0) > 0:
        return '转机会点'
    return None

# ============ 通用 CRUD ============
def row2dict(r):
    return {k: r[k] for k in r.keys()}

def list_rows(c, tbl, q=''):
    rows = c.execute('SELECT * FROM %s ORDER BY id DESC LIMIT 800' % tbl).fetchall()
    out = [row2dict(r) for r in rows]
    if q:
        ql = q.lower()
        out = [r for r in out if any(ql in str(v).lower() for v in r.values())]
    if tbl == 'leads':
        for r in out:
            st = lead_status_auto(c, r['id'])
            if st: r['status'] = st
    if tbl == 'projects':
        for r in out:
            fin = project_finance(c, r['id'])
            r['stage'] = project_stage(c, r['id'])
            r['amount_usd'] = fin['contract_usd']
            r['paid_usd'] = fin['paid_usd']
            r['due_usd'] = fin['due_usd']
            r['rate'] = fin['rate']
    if tbl == 'payments':
        for r in out:
            p = c.execute('SELECT proj_no FROM projects WHERE id=?', (r['proj_id'],)).fetchone()
            r['proj_no'] = p['proj_no'] if p else ''
    if tbl in ('quotes','contracts','production','purchases','outbounds','shipments'):
        for r in out:
            p = c.execute('SELECT proj_no FROM projects WHERE id=?', (r['proj_id'],)).fetchone()
            r['proj_no'] = p['proj_no'] if p else ''
    return out

def clean(tbl, data):
    fs = TABLES[tbl]
    out = {}
    for k, v in (data or {}).items():
        if k in fs:
            if isinstance(v, str): v = v.strip()
            if k in NUMERIC and v not in ('', None):
                try:
                    v = float(v)
                    if v == int(v): v = int(v)
                except Exception:
                    pass
            out[k] = v
    return out

def create(c, tbl, data, user):
    d = clean(tbl, data)
    d.setdefault('created', nowstr())
    d['updated'] = nowstr()
    if tbl in AUTO and not d.get(AUTO[tbl]):
        d[AUTO[tbl]] = next_no(c, tbl)
    # 项目自动带出客户信息
    if tbl == 'projects' and d.get('customer_id'):
        cu = c.execute('SELECT name_en,country,city FROM customers WHERE id=?', (d['customer_id'],)).fetchone()
        if cu:
            d.setdefault('title', cu['name_en'])
            if not d.get('country'): d['country'] = cu['country']
            if not d.get('city'): d['city'] = cu['city']
            if not d.get('amount'): d['amount'] = 0
            d.setdefault('currency', 'USD')
    if tbl == 'opportunities' and d.get('customer_id'):
        cu = c.execute('SELECT name_en,country,city FROM customers WHERE id=?', (d['customer_id'],)).fetchone()
        if cu:
            if not d.get('title'): d['title'] = cu['name_en']
            if not d.get('country'): d['country'] = cu['country']
            if not d.get('city'): d['city'] = cu['city']
    keys = list(d.keys())
    sql = 'INSERT INTO %s (%s) VALUES (%s)' % (tbl, ','.join(keys), ','.join('?' * len(keys)))
    cur = c.execute(sql, [d[k] for k in keys])
    rid = cur.lastrowid
    log(c, user, '新建', '%s#%s' % (tbl, rid), d.get(AUTO.get(tbl, ''), '') or str(d)[:80])
    c.commit()
    return rid

def update(c, tbl, rid, data, user):
    d = clean(tbl, data)
    d['updated'] = nowstr()
    if not d: return
    keys = list(d.keys())
    sql = 'UPDATE %s SET %s WHERE id=?' % (tbl, ','.join('%s=?' % k for k in keys))
    c.execute(sql, [d[k] for k in keys] + [rid])
    log(c, user, '修改', '%s#%s' % (tbl, rid), ','.join(keys))
    c.commit()

def delete(c, tbl, rid, user):
    for child, fk, _ in CHILD.get(tbl, []):
        c.execute('DELETE FROM %s WHERE %s=?' % (child, fk), (rid,))
    c.execute('DELETE FROM %s WHERE id=?' % tbl, (rid,))
    log(c, user, '删除', '%s#%s' % (tbl, rid), '')
    c.commit()

def detail(c, tbl, rid):
    r = c.execute('SELECT * FROM %s WHERE id=?' % tbl, (rid,)).fetchone()
    if not r: return None
    d = row2dict(r)
    kids = {}
    for child, fk, label in CHILD.get(tbl, []):
        rs = c.execute('SELECT * FROM %s WHERE %s=? ORDER BY id DESC' % (child, fk), (rid,)).fetchall()
        kids[child] = [row2dict(x) for x in rs]
        if child == 'projects':
            for x in kids[child]:
                fin = project_finance(c, x['id'])
                x.update({'stage': project_stage(c, x['id']), 'amount_usd': fin['contract_usd'],
                          'paid_usd': fin['paid_usd'], 'due_usd': fin['due_usd'], 'rate': fin['rate']})
    d['_children'] = kids
    if tbl == 'projects':
        fin = project_finance(c, rid)
        d.update({'stage': project_stage(c, rid), 'amount_usd': fin['contract_usd'],
                  'paid_usd': fin['paid_usd'], 'due_usd': fin['due_usd'], 'rate': fin['rate']})
    return d

# ============ 看板统计 ============
def summary(c):
    leads = c.execute('SELECT * FROM leads').fetchall()
    opps = c.execute('SELECT * FROM opportunities').fetchall()
    projs = c.execute('SELECT * FROM projects').fetchall()
    contracts = c.execute('SELECT * FROM contracts WHERE status!="已终止"').fetchall()
    payments = c.execute('SELECT * FROM payments WHERE status!="待确认"').fetchall()

    contract_usd = sum(usd(r['amount'], r['currency']) for r in contracts)
    paid_usd = sum(usd(r['amount'], r['currency']) for r in payments)
    due_usd = round(contract_usd - paid_usd, 2)

    # 项目维度结清
    settled = 0
    proj_list = []
    for p in projs:
        fin = project_finance(c, p['id'])
        st = project_stage(c, p['id'])
        proj_list.append({'id': p['id'], 'proj_no': p['proj_no'], 'title': p['title'],
                          'country': p['country'], 'city': p['city'], 'owner': p['owner'],
                          'stage': st, 'contract_usd': fin['contract_usd'], 'paid_usd': fin['paid_usd'],
                          'due_usd': fin['due_usd'], 'rate': fin['rate']})
        if st == '完成': settled += 1

    # 线索
    a_cnt = sum(1 for r in leads if (r['grade'] or '').startswith('A'))
    lead_by_src = {}
    for r in leads:
        lead_by_src[r['source'] or '未填'] = lead_by_src.get(r['source'] or '未填', 0) + 1

    # 国家分布
    by_country = {}
    for p in projs:
        k = p['country'] or '未填'
        by_country[k] = by_country.get(k, 0) + 1

    # 阶段分布
    stage_dist = {s: 0 for s in STAGES}
    for x in proj_list:
        stage_dist[x['stage']] = stage_dist.get(x['stage'], 0) + 1

    # 待跟进
    td = today()
    soon = (date.today() + timedelta(days=7)).isoformat()
    follow = []
    for r in leads:
        nf = r['next_follow'] or ''
        if nf and nf <= soon:
            follow.append({'lead_no': r['lead_no'], 'company': r['company'], 'country': r['country'],
                           'grade': r['grade'], 'next_follow': nf, 'owner': r['owner'],
                           'overdue': nf < td})

    # 评审待办
    pending_reviews = []
    for o in opps:
        done = c.execute('SELECT COUNT(*) n FROM reviews WHERE opp_id=?', (o['id'],)).fetchone()['n']
        if done < 4:
            pending_reviews.append({'opp_no': o['opp_no'], 'title': o['title'],
                                    'amount': o['amount'], 'currency': o['currency'],
                                    'step': REVIEW_STEPS[done] if done < 4 else '完成',
                                    'done': done})

    # 库存预警
    low = c.execute('SELECT * FROM products WHERE CAST(stock AS REAL) <= CAST(stock_min AS REAL)').fetchall()

    # 逾期应收（合同已签、未结清、签约超 60 天）
    overdue = []
    cut = (date.today() - timedelta(days=60)).isoformat()
    for ct in contracts:
        sd = ct['sign_date'] or ''
        if sd and sd <= cut:
            fin = project_finance(c, ct['proj_id'])
            if fin['due_usd'] > 0.01:
                overdue.append({'contract_no': ct['contract_no'], 'name': ct['name'],
                                'due_usd': fin['due_usd'], 'sign_date': sd})

    logs = c.execute('SELECT * FROM logs ORDER BY id DESC LIMIT 30').fetchall()

    return {
        'leads_total': len(leads),
        'leads_a': a_cnt,
        'opps_total': len(opps),
        'opps_amount_usd': round(sum(usd(o['amount'], o['currency']) for o in opps), 2),
        'projects_total': len(projs),
        'contract_total_usd': round(contract_usd, 2),
        'paid_total_usd': round(paid_usd, 2),
        'due_total_usd': due_usd,
        'settled': settled,
        'signed_count': len(contracts),
        'proj_list': proj_list,
        'stage_dist': stage_dist,
        'lead_by_src': lead_by_src,
        'by_country': by_country,
        'follow': follow,
        'pending_reviews': pending_reviews,
        'low_stock': [row2dict(r) for r in low],
        'overdue_ar': overdue,
        'logs': [row2dict(r) for r in logs],
        'today': td,
    }

# ============ 演示数据 ============
def seed(c):
    clear(c)
    U = '张伟'
    # 客户
    cust = [
        ('UZ-TAS-001','TOSHKENT ELEKTRO QURILMA','Toshkent Elektro Qurilma MChJ','乌兹别克斯坦','塔什干','终端用户','中国制造网','A 高意向','陈可雨'),
        ('UZ-SAM-002','SAMARKAND ENERGY LLC','Samarqand Energetika MChJ','乌兹别克斯坦','撒马尔罕','工程商','新媒体推广','A 高意向','王嘉译'),
        ('KZ-ALM-003','ALMATY POWER SYSTEMS','Almaty Power Systems LLP','哈萨克斯坦','阿拉木图','工程商','展会','B 一般意向','张茹滟'),
        ('KG-BSK-004','BISHKEK ELECTRO SERVIS','Bishkek Elektro Servis','吉尔吉斯斯坦','比什凯克','经销商','老客户转介绍','C 弱意向','陈可雨'),
        ('TM-ASH-005','ASHGABAT INDUSTRIAL GROUP','Ashgabat Industrial Group','土库曼斯坦','阿什哈巴德','终端用户','市场开发','A 高意向','王嘉译'),
    ]
    cids = {}
    for code, ne, nl, co, ci, ct, src, gr, ow in cust:
        d = {'code': code, 'name_en': ne, 'name_local': nl, 'country': co, 'city': ci,
             'ctype': ct, 'source': src, 'grade': gr, 'owner': ow, 'first_contact': '2026-11-20'}
        cids[code] = create(c, 'customers', d, U)

    # 线索
    leads = [
        ('中国制造网','TOSHKENT ELEKTRO QURILMA','乌兹别克斯坦','塔什干','Aziz Karimov','采购总监','+998 90 123 4567','a.karimov@teq.uz','10kV 变电站改造，需成套设备','高压成套柜','$680,000','A 高意向','转机会点','陈可雨','2026-11-25','2026-11-28'),
        ('新媒体推广','SAMARKAND ENERGY LLC','乌兹别克斯坦','撒马尔罕','Dilshod Nigmatov','项目经理','+998 91 234 5678','d.nigmatov@samenergy.uz','工厂配电升级，低压柜 20 面','低压成套柜','$280,000','A 高意向','持续跟进','王嘉译','2026-11-24','2026-11-25'),
        ('展会','ALMATY POWER SYSTEMS','哈萨克斯坦','阿拉木图','Yerlan Abdullaev','技术总监','+7 701 234 5678','e.abdullaev@almatypower.kz','商业综合体配电，含中压柜与变压器','成套项目','$1,200,000','B 一般意向','初次联系','张茹滟','2026-11-22','2026-11-27'),
        ('老客户转介绍','BISHKEK ELECTRO SERVIS','吉尔吉斯斯坦','比什凯克','Aibek Asanov','总经理','+996 555 123 456','a.asanov@bes.kg','零散元器件采购，量小','电气元器件','$15,000','C 弱意向','暂时搁置','陈可雨','2026-11-10',''),
        ('市场开发','ASHGABAT INDUSTRIAL GROUP','土库曼斯坦','阿什哈巴德','Merdan Rejepov','设备部经理','+993 65 123 456','m.rejepov@aig.tm','新建工厂低压配电，30 面柜','低压成套柜','$850,000','A 高意向','持续跟进','王嘉译','2026-11-23','2026-11-25'),
        ('邮件开发','DUSHANBE ELECTRIC CO.','塔吉克斯坦','杜尚别','Rustam Hojiyev','采购','+992 93 123 4567','r.hojiyev@dec.tj','询价后无回复','电气元器件','$8,000','C 弱意向','无效关闭','张茹滟','2026-11-05',''),
    ]
    lids = []
    for src, co, cn, ci, ct, ti, ph, em, dm, cat, bg, gr, st, ow, lf, nf in leads:
        d = {'source': src, 'company': co, 'country': cn, 'city': ci, 'contact': ct, 'title': ti,
             'phone': ph, 'email': em, 'demand': dm, 'category': cat, 'budget': bg, 'grade': gr,
             'status': st, 'owner': ow, 'last_follow': lf, 'next_follow': nf}
        if st == '无效关闭': d['close_reason'] = '无采购计划'
        lids.append(create(c, 'leads', d, U))

    # 机会点
    opps = [
        (lids[0], cids['UZ-TAS-001'], '塔什干变电站配电改造项目', '乌兹别克斯坦','塔什干','成套项目', 680000, 'USD','陈可雨'),
        (lids[1], cids['UZ-SAM-002'], '撒马尔罕工厂配电升级', '乌兹别克斯坦','撒马尔罕','成套项目', 280000, 'USD','王嘉译'),
        (lids[2], cids['KZ-ALM-003'], '阿拉木图商业综合体配电项目', '哈萨克斯坦','阿拉木图','成套项目', 1200000, 'USD','张茹滟'),
        (lids[4], cids['TM-ASH-005'], '阿什哈巴德工厂低压配电项目', '土库曼斯坦','阿什哈巴德','成套项目', 850000, 'USD','王嘉译'),
    ]
    oids = []
    for lid, cid, ti, co, ci, pt, am, cur, ow in opps:
        oids.append(create(c, 'opportunities', {'lead_id': lid, 'customer_id': cid, 'title': ti,
            'country': co, 'city': ci, 'ptype': pt, 'amount': am, 'currency': cur,
            'prob': 60, 'owner': ow}, U))

    # 评审：JD-001 走完 3 步，JD-002 走完 2 步，JD-003 走完 1 步，JD-004 全走完
    for i, steps in [(0, 3), (1, 2), (2, 1), (3, 4)]:
        for s in range(steps):
            create(c, 'reviews', {'opp_id': oids[i], 'step': REVIEW_STEPS[s],
                                  'reviewer': ['熊丽君','熊丽君','熊丽君','张伟'][s],
                                  'result': '通过', 'comment': '资料齐全，同意推进',
                                  'rdate': '2026-11-24'}, U)

    # 项目
    projs = [
        (cids['TM-ASH-005'], '阿什哈巴德工厂低压配电项目','土库曼斯坦','阿什哈巴德', 850000,'USD','熊丽君','2026-11-20'),
        (cids['UZ-TAS-001'], '塔什干变电站配电改造项目','乌兹别克斯坦','塔什干', 680000,'USD','熊丽君','2026-11-21'),
        (cids['UZ-SAM-002'], '撒马尔罕工厂配电升级','乌兹别克斯坦','撒马尔罕', 280000,'USD','陈可雨','2026-11-24'),
    ]
    pids = []
    for cid, ti, co, ci, am, cur, ow, sd in projs:
        pids.append(create(c, 'projects', {'customer_id': cid, 'title': ti, 'country': co, 'city': ci,
            'amount': am, 'currency': cur, 'owner': ow, 'sign_date': sd}, U))

    # 报价
    create(c, 'quotes', {'proj_id': pids[0], 'customer_id': cids['TM-ASH-005'], 'amount': 850000,
        'currency':'USD','qdate':'2026-11-18','valid_days':30,'incoterm':'FOB','pay_term':'T/T 30%定金+70%见提单','status':'客户接受'}, U)
    create(c, 'quotes', {'proj_id': pids[1], 'customer_id': cids['UZ-TAS-001'], 'amount': 680000,
        'currency':'USD','qdate':'2026-11-19','valid_days':30,'incoterm':'CIF','pay_term':'T/T 30%定金+70%见提单','status':'客户接受'}, U)
    create(c, 'quotes', {'proj_id': pids[2], 'customer_id': cids['UZ-SAM-002'], 'amount': 280000,
        'currency':'USD','qdate':'2026-11-24','valid_days':30,'incoterm':'FOB','pay_term':'T/T 30%定金+70%见提单','status':'已发出'}, U)

    # 合同
    create(c, 'contracts', {'proj_id': pids[0], 'customer_id': cids['TM-ASH-005'],
        'name':'阿什哈巴德低压配电柜采购合同','amount':850000,'currency':'USD','sign_date':'2026-11-20',
        'incoterm':'FOB','pay_term':'T/T 30%定金+70%见提单','status':'执行中'}, U)
    create(c, 'contracts', {'proj_id': pids[1], 'customer_id': cids['UZ-TAS-001'],
        'name':'塔什干变电站配电改造合同','amount':680000,'currency':'USD','sign_date':'2026-11-21',
        'incoterm':'CIF','pay_term':'T/T 30%定金+70%见提单','status':'执行中'}, U)

    # 生产
    create(c, 'production', {'proj_id': pids[0], 'product':'低压成套配电柜','spec':'GGD 380V 3200A',
        'qty':30,'unit':'面','progress':45,'plan_start':'2026-11-22','plan_end':'2026-12-20','status':'生产中'}, U)
    create(c, 'production', {'proj_id': pids[1], 'product':'高压成套柜','spec':'KYN28-12 1250A',
        'qty':10,'unit':'面','progress':100,'plan_start':'2026-11-22','plan_end':'2026-12-10','status':'已入库'}, U)

    # 采购
    create(c, 'purchases', {'proj_id': pids[0], 'material':'真空断路器','spec':'VS1-12/1250-31.5',
        'qty':20,'unit':'台','supplier':'正泰电器','price':8600,'currency':'CNY','odate':'2026-11-23','status':'在途'}, U)
    create(c, 'purchases', {'proj_id': pids[1], 'material':'真空断路器','spec':'VS1-12/1250-31.5',
        'qty':10,'unit':'台','supplier':'正泰电器','price':8600,'currency':'CNY','odate':'2026-11-23','status':'已入库'}, U)

    # 出库
    create(c, 'outbounds', {'proj_id': pids[1], 'detail':'高压成套柜 10 面，箱号 1-12','boxes':12,
        'odate':'2026-11-24','status':'已装箱'}, U)

    # 发货
    create(c, 'shipments', {'proj_id': pids[1], 'dest':'乌兹别克斯坦 塔什干','transport':'铁路',
        'bl_no':'BL-2026-00123','etd':'2026-11-26','eta':'2026-12-08','status':'已报关'}, U)

    # 回款
    create(c, 'payments', {'proj_id': pids[1], 'customer_id': cids['UZ-TAS-001'], 'amount':204000,
        'currency':'USD','pdate':'2026-11-25','method':'T/T 电汇','status':'部分回款'}, U)

    # 产品
    prods = [
        ('P-001','高压成套柜 KYN28','成套设备','KYN28-12 1250A','面', 68000,'USD', 3, 5),
        ('P-002','低压成套柜 GGD','成套设备','GGD 380V 3200A','面', 12500,'USD', 8, 10),
        ('P-003','MNS 抽屉柜','成套设备','MNS 4000A','面', 26000,'USD', 2, 3),
        ('P-004','干式变压器 SCB13','成套设备','SCB13-1000kVA','台', 42000,'USD', 1, 2),
        ('P-005','箱式变电站','成套设备','YB-12/0.4-630','台', 78000,'USD', 0, 2),
        ('P-006','真空断路器 VS1','元器件','VS1-12/1250-31.5','台', 1200,'USD', 40, 20),
        ('P-007','智能监测装置 DXN8-Q','元器件','DXN8-Q','只', 320,'USD', 15, 30),
        ('P-008','无功补偿装置 SVG','元器件','SVG-100kvar','套', 18000,'USD', 4, 3),
    ]
    for code, nm, cat, sp, un, pr, cur, st, mn in prods:
        create(c, 'products', {'code':code,'name':nm,'category':cat,'spec':sp,'unit':un,
            'price':pr,'currency':cur,'stock':st,'stock_min':mn}, U)

    # 供应商
    sups = [
        ('GYS-001','正泰电器','断路器/开关','施经理','138-0013-8000','sales@chint.example','浙江乐清'),
        ('GYS-002','德力西电气','低压电器','王经理','138-0013-8001','sales@delixi.example','浙江乐清'),
        ('GYS-003','宝钢股份','钢板/柜体','李经理','138-0013-8002','sales@baosteel.example','上海'),
        ('GYS-004','许继电气','继保装置','赵经理','138-0013-8003','sales@xj.example','河南许昌'),
    ]
    for code, nm, cat, ct, ph, em, ad in sups:
        create(c, 'suppliers', {'code':code,'name':nm,'category':cat,'contact':ct,'phone':ph,'email':em,'addr':ad}, U)

    log(c, U, '系统', '演示数据', '5 客户 / 6 线索 / 4 机会点 / 3 项目 / 全流程单据')
    c.commit()

def clear(c):
    for t in list(TABLES.keys()):
        c.execute('DELETE FROM %s' % t)
    c.execute('DELETE FROM logs')
    c.commit()


# ============ HTTP 服务 ============
class H(BaseHTTPRequestHandler):
    server_version = 'XiuYuanLTC/2.1'
    def log_message(self, *a):
        pass

    def _send(self, code, body, ctype='application/json; charset=utf-8'):
        if isinstance(body, str):
            body = body.encode('utf-8')
        self.send_response(code)
        self.send_header('Content-Type', ctype)
        self.send_header('Content-Length', str(len(body)))
        self.send_header('Cache-Control', 'no-store')
        self.end_headers()
        try:
            self.wfile.write(body)
        except Exception:
            pass

    def _json(self, obj, code=200):
        self._send(code, json.dumps(obj, ensure_ascii=False, default=str))

    def _body(self):
        try:
            n = int(self.headers.get('Content-Length') or 0)
            raw = self.rfile.read(n) if n else b'{}'
            return json.loads(raw.decode('utf-8') or '{}')
        except Exception:
            return {}

    def _user(self):
        u = self.headers.get('X-User') or ''
        try:
            from urllib.parse import unquote
            u = unquote(u)
        except Exception:
            pass
        return u or '张伟'

    def do_GET(self):
        try:
            return self._do_GET()
        except Exception as e:
            import traceback; traceback.print_exc()
            return self._json({'error': str(e)}, 500)

    def _do_GET(self):
        u = urlparse(self.path)
        path = u.path
        qs = parse_qs(u.query)
        if path in ('/', '/index.html'):
            if not os.path.exists(UI):
                return self._send(404, 'UI missing', 'text/plain; charset=utf-8')
            return self._send(200, io.open(UI, encoding='utf-8').read(), 'text/html; charset=utf-8')
        if path == '/api/meta':
            return self._json({
                'countries': COUNTRIES, 'sources': SOURCES, 'grades': GRADES,
                'lead_st': LEAD_ST, 'close_reasons': CLOSE_REASONS, 'stages': STAGES,
                'ptypes': PTYPES, 'currs': CURRS, 'incoterms': INCOTERMS, 'pay_terms': PAY_TERMS,
                'quote_st': QUOTE_ST, 'contract_st': CONTRACT_ST, 'prod_st': PROD_ST,
                'po_st': PO_ST, 'out_st': OUT_ST, 'ship_st': SHIP_ST, 'pay_st': PAY_ST,
                'pay_methods': PAY_METHODS, 'roles': ROLES, 'review_steps': REVIEW_STEPS,
                'tables': {k: v for k, v in TABLES.items()},
            })
        if path == '/api/dash':
            uu = (qs.get('u', ['']) or [''])[0] or self._user()
            return self._json(build_dash(uu))
        if path == '/api/summary':
            c = conn()
            try:
                return self._json(summary(c))
            finally:
                c.close()
        if path == '/api/logs':
            c = conn()
            try:
                rs = c.execute('SELECT * FROM logs ORDER BY id DESC LIMIT 300').fetchall()
                return self._json([row2dict(r) for r in rs])
            finally:
                c.close()
        m = re.match(r'^/api/(\w+)(?:/(\d+))?$', path)
        if m:
            tbl, rid = m.group(1), m.group(2)
            if tbl not in TABLES:
                return self._json({'error': 'no table ' + tbl}, 404)
            c = conn()
            try:
                if rid:
                    d = detail(c, tbl, int(rid))
                    if d is None:
                        return self._json({'error': 'not found'}, 404)
                    return self._json(d)
                return self._json(list_rows(c, tbl, (qs.get('q') or [''])[0]))
            finally:
                c.close()
        return self._json({'error': 'bad path'}, 404)

    def do_POST(self):
        try:
            return self._do_POST()
        except Exception as e:
            import traceback; traceback.print_exc()
            return self._json({'error': str(e)}, 500)

    def _do_POST(self):
        u = urlparse(self.path)
        path = u.path
        user = self._user()
        if path == '/api/seed':
            c = conn()
            try:
                seed(c)
                return self._json({'ok': True})
            finally:
                c.close()
        if path == '/api/clear':
            c = conn()
            try:
                clear(c)
                log(c, user, '系统', '清空数据', '全部业务数据已清空')
                c.commit()
                return self._json({'ok': True})
            finally:
                c.close()
        m = re.match(r'^/api/(\w+)$', path)
        if m and m.group(1) in TABLES:
            tbl = m.group(1)
            data = self._body()
            c = conn()
            try:
                rid = create(c, tbl, data, user)
                return self._json({'ok': True, 'id': rid})
            except Exception as e:
                return self._json({'ok': False, 'error': str(e)}, 400)
            finally:
                c.close()
        return self._json({'error': 'bad path'}, 404)

    def do_PUT(self):
        try:
            return self._do_PUT()
        except Exception as e:
            import traceback; traceback.print_exc()
            return self._json({'error': str(e)}, 500)

    def _do_PUT(self):
        u = urlparse(self.path)
        m = re.match(r'^/api/(\w+)/(\d+)$', u.path)
        if m and m.group(1) in TABLES:
            tbl, rid = m.group(1), int(m.group(2))
            data = self._body()
            c = conn()
            try:
                update(c, tbl, rid, data, self._user())
                return self._json({'ok': True})
            except Exception as e:
                return self._json({'ok': False, 'error': str(e)}, 400)
            finally:
                c.close()
        return self._json({'error': 'bad path'}, 404)

    def do_DELETE(self):
        try:
            return self._do_DELETE()
        except Exception as e:
            import traceback; traceback.print_exc()
            return self._json({'error': str(e)}, 500)

    def _do_DELETE(self):
        u = urlparse(self.path)
        m = re.match(r'^/api/(\w+)/(\d+)$', u.path)
        if m and m.group(1) in TABLES:
            tbl, rid = m.group(1), int(m.group(2))
            c = conn()
            try:
                delete(c, tbl, rid, self._user())
                return self._json({'ok': True})
            finally:
                c.close()
        return self._json({'error': 'bad path'}, 404)



# ============================================================
#  岗位工作台 /api/dash —— 每个成员一套，按岗位出活
#  金额一律返回数字（已折算 USD），前端 usdTxt() 负责格式化
# ============================================================
def _rows(c, sql, args=()):
    cur = c.execute(sql, args)
    if cur.description is None:
        return []
    cols = [d[0] for d in cur.description]
    return [dict(zip(cols, r)) for r in cur.fetchall()]


def _n(x):
    try:
        return float(x or 0)
    except Exception:
        return 0.0


def _usd(a, cur='USD'):
    return usd(a, cur)


def _od(s):
    try:
        return (date.today() - datetime.strptime(s, '%Y-%m-%d').date()).days
    except Exception:
        return None


def _kpi(lb, vl, sub='', cls=''):
    return {'lb': lb, 'vl': vl, 'sub': sub, 'cls': cls}


def _panel(title, cols, rows, more='', empty='暂无数据'):
    return {'title': title, 'cols': cols, 'rows': rows, 'more': more, 'empty': empty}



def _hex_lerp(a, b, t):
    return '#%02X%02X%02X' % tuple(int(round(x + (y - x) * t)) for x, y in zip(a, b))


def _overview(c):
    """全链路数据总览 —— 客户→线索→机会→评审→项目→报价→合同→生产→采购→出库发货→回款"""
    def one(sql, args=()):
        r = c.execute(sql, args).fetchone()
        return (r[0] if r else 0) or 0

    def amt(sql, args=()):
        return _n(one(sql, args))

    cus = int(one("SELECT COUNT(*) FROM customers"))
    le = int(one("SELECT COUNT(*) FROM leads"))
    le_a = int(one("SELECT COUNT(*) FROM leads WHERE grade LIKE 'A%'"))
    op = int(one("SELECT COUNT(*) FROM opportunities"))
    op_amt = amt("SELECT SUM(amount) FROM opportunities")
    rv = int(one("SELECT COUNT(*) FROM reviews"))
    pj = int(one("SELECT COUNT(*) FROM projects"))
    pj_amt = amt("SELECT SUM(amount) FROM projects")
    qt = int(one("SELECT COUNT(*) FROM quotes"))
    qt_amt = amt("SELECT SUM(amount) FROM quotes")
    ct = int(one("SELECT COUNT(*) FROM contracts"))
    ct_amt = amt("SELECT SUM(amount) FROM contracts")
    pr = int(one("SELECT COUNT(*) FROM production"))
    pu = int(one("SELECT COUNT(*) FROM purchases"))
    sh = int(one("SELECT COUNT(*) FROM shipments"))
    py = int(one("SELECT COUNT(*) FROM payments"))
    py_amt = amt("SELECT SUM(amount) FROM payments WHERE status IN ('部分回款','已结清')")
    due = ct_amt - py_amt

    BLUE = (0x0A, 0x7C, 0xB3)
    GREEN = (0x23, 0x64, 0x4C)

    raw = [
        ('客户', cus, 'cnt', '家客户'),
        ('线索', le, 'cnt', 'A 类 %d 条' % le_a),
        ('机会点', op_amt, 'amt', '%d 个' % op),
        ('评审', rv, 'cnt', '条记录'),
        ('项目', pj_amt, 'amt', '%d 个' % pj),
        ('报价', qt_amt, 'amt', '%d 份' % qt),
        ('合同', ct_amt, 'amt', '%d 份' % ct),
        ('生产', pr, 'cnt', '张生产单'),
        ('采购', pu, 'cnt', '张采购单'),
        ('发货', sh, 'cnt', '票已发'),
        ('回款', py_amt, 'amt', '%d 笔' % py),
    ]
    n = len(raw) - 1
    out = []
    for i, (lb, v, t, sub) in enumerate(raw):
        out.append({
            'lb': lb, 'v': v, 't': t, 'sub': sub,
            'no': '%02d' % (i + 1),
            'c': _hex_lerp(BLUE, GREEN, i / n if n else 0),
        })
    return {'items': out, 'due': due, 'due_txt': _fmt_wan(due), 'ct_amt': ct_amt, 'py_amt': py_amt,
            'rate': round((py_amt / ct_amt * 100), 1) if ct_amt else 0}


def _fmt_wan(x):
    try:
        x = float(x or 0)
    except Exception:
        return '0'
    if abs(x) >= 1000000:
        return '$%.2fM' % (x / 1000000)
    if abs(x) >= 1000:
        return '$%.0fK' % (x / 1000)
    return '$%d' % x

def build_dash(user):
    c = conn()
    try:
        return _build_dash(c, user)
    finally:
        c.close()


def _build_dash(c, user):
    r = next((x for x in ROLES if x['uname'] == user), None) or ROLES[0]
    role, dept = r['role'], r['dept']
    td = today()
    hh = datetime.now().hour
    gw = '上午好' if hh < 12 else ('下午好' if hh < 18 else '晚上好')
    D = {'user': user, 'role': role, 'dept': dept, 'today': td,
         'greet': gw + '，' + user, 'kpis': [], 'panels': [], 'overview': None}

    # ---------- 张伟 · 总经理 ----------
    if user == '张伟':
        ct = _n(_rows(c, "SELECT SUM(amount) v FROM contracts WHERE status='执行中'")[0]['v'])
        pd = _n(_rows(c, "SELECT SUM(amount) v FROM payments WHERE status IN ('部分回款','已结清')")[0]['v'])
        cs = _rows(c, "SELECT id FROM contracts WHERE status='执行中'")
        pj = _rows(c, "SELECT * FROM projects")
        D['kpis'] = [
            _kpi('合同总额', _usd(ct), '%d 份生效合同' % len(cs), 'g'),
            _kpi('累计回款', _usd(pd), '回款率 %.1f%%' % ((pd / ct * 100) if ct else 0), 'b'),
            _kpi('应收余额', _usd(ct - pd), '合同额 − 已回款', 'r'),
            _kpi('项目总数', len(pj), '在建 %d 个' % len([x for x in pj if x.get('sign_date')]), ''),
        ]
        rev = _rows(c, """SELECT v.review_no,v.step,v.opp_id,o.title,o.amount,o.currency
            FROM reviews v LEFT JOIN opportunities o ON o.id=v.opp_id
            WHERE v.result IS NULL OR v.result='' ORDER BY v.id""")
        D['panels'].append(_panel('待我评审', ['评审单号', '环节', '机会点', '金额'],
            [[x['review_no'], x['step'], x['title'] or ('#' + str(x['opp_id'])), _usd(x['amount'], x['currency'])] for x in rev],
            'reviews', '没有待评审的机会点'))
        od = _rows(c, """SELECT p.pay_no,p.invoice_no,p.amount,p.currency,p.due_date,p.status,c.name_en
            FROM payments p LEFT JOIN customers c ON c.id=p.customer_id
            WHERE p.due_date IS NOT NULL AND p.due_date<>'' AND p.due_date < ?
            AND p.status <> '已结清' ORDER BY p.due_date""", (td,))
        D['panels'].append(_panel('逾期未回款', ['回款单', '客户', '金额', '到期日', '逾期'],
            [[x['pay_no'], x['name_en'] or '—', _usd(x['amount'], x['currency']), x['due_date'],
              ('%d 天' % _od(x['due_date'])) if _od(x['due_date']) is not None else '—'] for x in od],
            'payments', '没有逾期账款'))
        pl = _rows(c, "SELECT proj_no,title,amount,currency,owner FROM projects ORDER BY id DESC LIMIT 8")
        D['panels'].append(_panel('在建项目', ['项目编号', '项目名称', '金额', '负责人'],
            [[x['proj_no'], x['title'], _usd(x['amount'], x['currency']), x['owner'] or '—'] for x in pl],
            'projects', '还没有项目'))

        D['overview'] = _overview(c)

    # ---------- 熊丽君 · 国贸部负责人 ----------
    elif user == '熊丽君':
        lt = _rows(c, "SELECT COUNT(*) n FROM leads")[0]['n']
        la = _rows(c, "SELECT COUNT(*) n FROM leads WHERE grade LIKE 'A%'")[0]['n']
        oa = _n(_rows(c, "SELECT SUM(amount) v FROM opportunities")[0]['v'])
        on = _rows(c, "SELECT COUNT(*) n FROM opportunities")[0]['n']
        rv = _rows(c, "SELECT COUNT(*) n FROM reviews WHERE result IS NULL OR result=''")[0]['n']
        D['kpis'] = [
            _kpi('线索池总量', lt, 'A 类高意向 %d 条' % la, 'b'),
            _kpi('A 类线索', la, '优先跟进', 'g'),
            _kpi('机会池金额', _usd(oa), '%d 个机会点' % on, ''),
            _kpi('待确认评审', rv, '需要我过' if rv else '已清', 'a' if rv else 'g'),
        ]
        fo = _rows(c, """SELECT company,grade,next_follow,owner,country FROM leads
            WHERE next_follow IS NOT NULL AND next_follow<>'' ORDER BY next_follow""")
        D['panels'].append(_panel('团队待跟进', ['客户', '等级', '提醒日', '归属', '国家'],
            [[x['company'], (x['grade'] or '')[:1], x['next_follow'], x['owner'] or '—', x['country'] or '—'] for x in fo],
            'leads', '没有安排跟进'))
        op = _rows(c, "SELECT opp_no,title,amount,currency,prob,owner FROM opportunities ORDER BY amount DESC")
        D['panels'].append(_panel('机会池', ['机会点', '名称', '金额', '概率', '负责人'],
            [[x['opp_no'], x['title'], _usd(x['amount'], x['currency']), str(x['prob'] or '') + '%', x['owner'] or '—'] for x in op],
            'opps', '机会池是空的'))

        D['overview'] = _overview(c)

    # ---------- 高振永 · 外贸技术支持 ----------
    elif user == '高振永':
        pr = _rows(c, "SELECT * FROM production")
        wip = len([x for x in pr if (x.get('status') or '') == '生产中'])
        done = len([x for x in pr if (x.get('status') or '') in ('已入库', '已完工')])
        pu = _rows(c, "SELECT * FROM purchases")
        way = len([x for x in pu if (x.get('status') or '') == '在途'])
        D['kpis'] = [
            _kpi('在制订单', wip, '生产线上', 'b'),
            _kpi('已完工', done, '可发运', 'g'),
            _kpi('采购在途', way, '等供应商交货', ''),
            _kpi('生产单总数', len(pr), '含已入库', 'a'),
        ]
        D['panels'].append(_panel('生产订单', ['生产单号', '产品', '数量', '进度', '计划完工', '状态'],
            [[x['prod_no'], x['product'], '%s %s' % (x['qty'], x.get('unit') or '面'), str(x['progress'] or 0) + '%',
              x['plan_end'] or '—', x['status']] for x in pr], 'production', '还没有生产订单'))
        D['panels'].append(_panel('采购单', ['采购单号', '物料', '数量', '供应商', '下单日', '状态'],
            [[x['po_no'], x['material'], x['qty'], x['supplier'] or '—', x['odate'] or '—', x['status']] for x in pu],
            'purchases', '还没有采购单'))

        D['overview'] = _overview(c)

    # ---------- 王嘉译 · 新媒体运营·AI中心 ----------
    elif user == '王嘉译':
        ls = _rows(c, "SELECT * FROM leads WHERE source='新媒体推广' OR owner=?", (user,))
        a = len([x for x in ls if (x.get('grade') or '').startswith('A')])
        cnv = len([x for x in ls if (x.get('status') or '') == '转机会点'])
        op = _rows(c, "SELECT COUNT(*) n FROM opportunities WHERE owner=?", (user,))[0]['n']
        D['kpis'] = [
            _kpi('新媒体线索', len(ls), '来自新媒体推广', 'b'),
            _kpi('A 类高意向', a, '优先跟', 'g'),
            _kpi('已转机会', cnv, '转化率 %.0f%%' % ((cnv / len(ls) * 100) if ls else 0), ''),
            _kpi('我的机会点', op, '名下机会单', 'a'),
        ]
        D['panels'].append(_panel('新媒体来源线索', ['线索编号', '客户', '等级', '状态', '归属', '提醒日'],
            [[x['lead_no'], x['company'], (x['grade'] or '')[:1], x['status'], x['owner'] or '—', x['next_follow'] or '—'] for x in ls],
            'leads', '新媒体还没有带来线索'))

    # ---------- 陈可雨 · 外贸助理 ----------
    elif user == '陈可雨':
        my = _rows(c, "SELECT * FROM leads WHERE owner=?", (user,))
        todo = [x for x in my if (x.get('next_follow') or '') and x['next_follow'] <= td
                and (x.get('status') or '') not in ('无效关闭', '转机会点', '暂时搁置')]
        qs = _rows(c, "SELECT * FROM quotes WHERE customer_id IN (SELECT id FROM customers WHERE owner=?)", (user,))
        cs = _rows(c, "SELECT * FROM contracts WHERE customer_id IN (SELECT id FROM customers WHERE owner=?)", (user,))
        pj = _rows(c, "SELECT * FROM projects WHERE owner=?", (user,))
        D['kpis'] = [
            _kpi('我的线索', len(my), '名下线索', 'b'),
            _kpi('今日待跟进', len(todo), '不能拖' if todo else '清空了', 'r' if todo else 'g'),
            _kpi('我的报价', len(qs), '共 %d 份' % len(qs), ''),
            _kpi('我的合同', len(cs), '已签约', 'a'),
        ]
        D['panels'].append(_panel('今日待跟进', ['客户', '等级', '来源', '状态', '国家'],
            [[x['company'], (x['grade'] or '')[:1], x['source'] or '—', x['status'], x['country'] or '—'] for x in todo],
            'leads', '今天没有要跟进的，可以去线索池捞新的'))
        D['panels'].append(_panel('我的项目', ['项目编号', '项目名称', '金额', '签约日'],
            [[x['proj_no'], x['title'], _usd(x['amount'], x['currency']), x['sign_date'] or '—'] for x in pj],
            'projects', '名下还没有项目'))

    # ---------- 陈雨诗 · 外贸行政人事 ----------
    elif user == '陈雨诗':
        lg = _rows(c, "SELECT * FROM logs ORDER BY id DESC LIMIT 12")
        tot = _rows(c, "SELECT COUNT(*) n FROM logs")[0]['n']
        act = len(set([x.get('user') for x in _rows(c, "SELECT user FROM logs WHERE ts LIKE ?", (td + '%',))]))
        D['kpis'] = [
            _kpi('操作记录', tot, '全部日志', 'b'),
            _kpi('系统账号', len(ROLES), '10 个岗位', ''),
            _kpi('今日活跃', act, '有人操作' if act else '还没人', 'g'),
            _kpi('异常操作', 0, '暂无', 'g'),
        ]
        D['panels'].append(_panel('最近操作', ['时间', '操作人', '动作', '内容'],
            [[x.get('ts') or '', x.get('user') or '', x.get('action') or '',
              x.get('detail') or x.get('target') or ''] for x in lg], 'logs', '还没有操作记录'))

    # ---------- 张茹滟 · 中国制造网平台运营 ----------
    elif user == '张茹滟':
        ls = _rows(c, "SELECT * FROM leads WHERE source='中国制造网'")
        a = len([x for x in ls if (x.get('grade') or '').startswith('A')])
        cnv = len([x for x in ls if (x.get('status') or '') == '转机会点'])
        todo = len([x for x in ls if (x.get('next_follow') or '') and x['next_follow'] <= td])
        D['kpis'] = [
            _kpi('平台询盘', len(ls), '中国制造网来源', 'b'),
            _kpi('A 类高意向', a, '优先跟', 'g'),
            _kpi('已转机会', cnv, '转化率 %.0f%%' % ((cnv / len(ls) * 100) if ls else 0), ''),
            _kpi('待跟进', todo, '今天该联系' if todo else '清空了', 'r' if todo else 'g'),
        ]
        D['panels'].append(_panel('平台来源线索', ['线索编号', '客户', '国家', '等级', '状态', '归属', '提醒日'],
            [[x['lead_no'], x['company'], x['country'] or '—', (x['grade'] or '')[:1], x['status'],
              x['owner'] or '—', x['next_follow'] or '—'] for x in ls], 'leads', '平台还没有询盘'))

    # ---------- 崔永越 · 外贸业务员 ----------
    elif user == '崔永越':
        my = _rows(c, "SELECT * FROM leads WHERE owner=?", (user,))
        op = _rows(c, "SELECT * FROM opportunities WHERE owner=?", (user,))
        qs = _rows(c, "SELECT * FROM quotes WHERE customer_id IN (SELECT id FROM customers WHERE owner=?)", (user,))
        cs = _rows(c, "SELECT * FROM contracts WHERE customer_id IN (SELECT id FROM customers WHERE owner=?)", (user,))
        todo = [x for x in my if (x.get('next_follow') or '') and x['next_follow'] <= td
                and (x.get('status') or '') not in ('无效关闭', '转机会点', '暂时搁置')]
        D['kpis'] = [
            _kpi('我的线索', len(my), '名下线索', 'b'),
            _kpi('今日待跟进', len(todo), '不能拖' if todo else '清空了', 'r' if todo else 'g'),
            _kpi('我的报价额', _usd(_n(sum([_n(x['amount']) for x in qs]))), '%d 份报价' % len(qs), ''),
            _kpi('我的合同额', _usd(_n(sum([_n(x['amount']) for x in cs]))), '%d 份合同' % len(cs), 'a'),
        ]
        D['panels'].append(_panel('今日待跟进', ['客户', '等级', '来源', '状态', '国家'],
            [[x['company'], (x['grade'] or '')[:1], x['source'] or '—', x['status'], x['country'] or '—'] for x in todo],
            'leads', '今天没有待跟进 —— 去线索池接一条新线索'))
        D['panels'].append(_panel('我的机会点', ['机会点', '名称', '金额', '概率'],
            [[x['opp_no'], x['title'], _usd(x['amount'], x['currency']), str(x['prob'] or '') + '%'] for x in op],
            'opps', '名下还没有机会点'))

    # ---------- 李艳英 · 采购 ----------
    elif user == '李艳英':
        pu = _rows(c, "SELECT * FROM purchases")
        wait = len([x for x in pu if (x.get('status') or '') not in ('在途', '已入库')])
        way = len([x for x in pu if (x.get('status') or '') == '在途'])
        arv = len([x for x in pu if (x.get('status') or '') == '已入库'])
        pr = _rows(c, "SELECT * FROM production WHERE status='生产中'")
        D['kpis'] = [
            _kpi('待采购', wait, '还没下单' if wait else '无', 'r' if wait else 'g'),
            _kpi('在途采购', way, '等供应商交货', 'b'),
            _kpi('已入库', arv, '本月到货', 'g'),
            _kpi('生产中订单', len(pr), '要盯物料', ''),
        ]
        D['panels'].append(_panel('采购单', ['采购单号', '物料', '数量', '供应商', '下单日', '状态'],
            [[x['po_no'], x['material'], x['qty'], x['supplier'] or '—', x['odate'] or '—', x['status']] for x in pu],
            'purchases', '没有采购单'))
        D['panels'].append(_panel('生产中 · 物料要盯', ['生产单号', '产品', '数量', '进度', '完工日'],
            [[x['prod_no'], x['product'], x['qty'], str(x['progress'] or 0) + '%', x['plan_end'] or '—'] for x in pr],
            'production', '没有在制订单'))

    # ---------- 夏丽珍 · 财务 ----------
    elif user == '夏丽珍':
        ct = _n(_rows(c, "SELECT SUM(amount) v FROM contracts WHERE status='执行中'")[0]['v'])
        pd = _n(_rows(c, "SELECT SUM(amount) v FROM payments WHERE status IN ('部分回款','已结清')")[0]['v'])
        py = _rows(c, "SELECT * FROM payments")
        od = [x for x in py if (x.get('due_date') or '') and x['due_date'] < td and (x.get('status') or '') != '已结清']
        odamt = _n(sum([_n(x['amount']) for x in od]))
        D['kpis'] = [
            _kpi('应收余额', _usd(ct - pd), '合同额 − 已回款', 'r'),
            _kpi('逾期金额', _usd(odamt), '%d 笔逾期' % len(od), 'r' if od else 'g'),
            _kpi('累计回款', _usd(pd), '回款率 %.1f%%' % ((pd / ct * 100) if ct else 0), 'b'),
            _kpi('回款笔数', len(py), '已登记', 'g'),
        ]
        D['panels'].append(_panel('逾期账款', ['回款单', '发票号', '金额', '到期日', '逾期', '状态'],
            [[x['pay_no'], x['invoice_no'] or '—', _usd(x['amount'], x['currency']), x['due_date'],
              ('%d 天' % _od(x['due_date'])) if _od(x['due_date']) is not None else '—', x['status']] for x in od],
            'payments', '没有逾期账款'))
        D['panels'].append(_panel('全部回款记录', ['回款单', '金额', '回款日', '方式', '状态'],
            [[x['pay_no'], _usd(x['amount'], x['currency']), x['pdate'] or '—', x['method'] or '—', x['status']] for x in py],
            'payments', '还没有回款记录'))

    # ---------- 兜底 ----------
    else:
        D['kpis'] = [_kpi('线索池总量', _rows(c, "SELECT COUNT(*) n FROM leads")[0]['n'], '全部', 'b')]
        D['panels'].append(_panel('提示', ['说明'], [['该岗位还没有定制工作台']], '', ''))

    return D

def main():
    init()
    port = PORT0
    srv = None
    for i in range(20):
        try:
            srv = ThreadingHTTPServer(('0.0.0.0', port), H)
            break
        except OSError:
            port += 1
    if srv is None:
        print('no free port'); sys.exit(1)
    url = 'http://127.0.0.1:%d/' % port
    try:
        _hn = socket.gethostname()
        _lan = ''
        for _i in socket.getaddrinfo(_hn, None):
            _a = _i[4][0]
            if _a.count('.') == 3 and not _a.startswith('127.'):
                _lan = _a
                break
    except Exception:
        _lan = ''
    print('=' * 60)
    print(' 休元外贸 LTC 系统已启动')
    print('  本机访问: ' + url)
    if _lan:
        print('  同事访问: http://%s:%d/' % (_lan, port))
    print('  数据文件: ' + DB)
    print(' 数据文件: ' + DB)
    print('=' * 56)
    def openit():
        time.sleep(1.0)
        try:
            webbrowser.open(url)
        except Exception:
            pass
    threading.Thread(target=openit, daemon=True).start()
    try:
        srv.serve_forever()
    except KeyboardInterrupt:
        pass


if __name__ == '__main__':
    main()
