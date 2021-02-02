'use strict';

var net = require('net');
var url = require('url');
var util = require('util');
var _commonjsHelpers = require('./_commonjsHelpers-49936489.js');
var Punycode = require('punycode');
var tls = require('tls');
var http = require('http');
var https = require('https');
var events = require('events');
var assert = require('assert');
var require$$0$1 = require('domain');
var crypto = require('crypto');
var buffer = require('buffer');
var Stream$3 = require('stream');

function _interopDefaultLegacy(e) {
  return e && typeof e === 'object' && 'default' in e ? e : { default: e };
}

var net__default = /*#__PURE__*/ _interopDefaultLegacy(net);
var url__default = /*#__PURE__*/ _interopDefaultLegacy(url);
var util__default = /*#__PURE__*/ _interopDefaultLegacy(util);
var Punycode__default = /*#__PURE__*/ _interopDefaultLegacy(Punycode);
var tls__default = /*#__PURE__*/ _interopDefaultLegacy(tls);
var http__default = /*#__PURE__*/ _interopDefaultLegacy(http);
var https__default = /*#__PURE__*/ _interopDefaultLegacy(https);
var events__default = /*#__PURE__*/ _interopDefaultLegacy(events);
var assert__default = /*#__PURE__*/ _interopDefaultLegacy(assert);
var require$$0__default = /*#__PURE__*/ _interopDefaultLegacy(require$$0$1);
var crypto__default = /*#__PURE__*/ _interopDefaultLegacy(crypto);
var buffer__default = /*#__PURE__*/ _interopDefaultLegacy(buffer);
var Stream__default = /*#__PURE__*/ _interopDefaultLegacy(Stream$3);

var domain; // The domain module is executed on demand
var hasSetImmediate = typeof setImmediate === 'function';

// Use the fastest means possible to execute a task in its own turn, with
// priority over other events including network IO events in Node.js.
//
// An exception thrown by a task will permanently interrupt the processing of
// subsequent tasks. The higher level `asap` function ensures that if an
// exception is thrown by a task, that the task queue will continue flushing as
// soon as possible, but if you use `rawAsap` directly, you are responsible to
// either ensure that no exceptions are thrown from your task, or to manually
// call `rawAsap.requestFlush` if an exception is thrown.
var raw = rawAsap;
function rawAsap(task) {
  if (!queue.length) {
    requestFlush();
    flushing = true;
  }
  // Avoids a function call
  queue[queue.length] = task;
}

var queue = [];
// Once a flush has been requested, no further calls to `requestFlush` are
// necessary until the next `flush` completes.
var flushing = false;
// The position of the next task to execute in the task queue. This is
// preserved between calls to `flush` so that it can be resumed if
// a task throws an exception.
var index = 0;
// If a task schedules additional tasks recursively, the task queue can grow
// unbounded. To prevent memory excaustion, the task queue will periodically
// truncate already-completed tasks.
var capacity = 1024;

// The flush function processes all tasks that have been scheduled with
// `rawAsap` unless and until one of those tasks throws an exception.
// If a task throws an exception, `flush` ensures that its state will remain
// consistent and will resume where it left off when called again.
// However, `flush` does not make any arrangements to be called again if an
// exception is thrown.
function flush() {
  while (index < queue.length) {
    var currentIndex = index;
    // Advance the index before calling the task. This ensures that we will
    // begin flushing on the next task the task throws an error.
    index = index + 1;
    queue[currentIndex].call();
    // Prevent leaking memory for long chains of recursive calls to `asap`.
    // If we call `asap` within tasks scheduled by `asap`, the queue will
    // grow, but to avoid an O(n) walk for every task we execute, we don't
    // shift tasks off the queue after they have been executed.
    // Instead, we periodically shift 1024 tasks off the queue.
    if (index > capacity) {
      // Manually shift all values starting at the index back to the
      // beginning of the queue.
      for (var scan = 0, newLength = queue.length - index; scan < newLength; scan++) {
        queue[scan] = queue[scan + index];
      }
      queue.length -= index;
      index = 0;
    }
  }
  queue.length = 0;
  index = 0;
  flushing = false;
}

rawAsap.requestFlush = requestFlush;
function requestFlush() {
  // Ensure flushing is not bound to any domain.
  // It is not sufficient to exit the domain, because domains exist on a stack.
  // To execute code outside of any domain, the following dance is necessary.
  var parentDomain = process.domain;
  if (parentDomain) {
    if (!domain) {
      // Lazy execute the domain module.
      // Only employed if the user elects to use domains.
      domain = require$$0__default['default'];
    }
    domain.active = process.domain = null;
  }

  // `setImmediate` is slower that `process.nextTick`, but `process.nextTick`
  // cannot handle recursion.
  // `requestFlush` will only be called recursively from `asap.js`, to resume
  // flushing after an error is thrown into a domain.
  // Conveniently, `setImmediate` was introduced in the same version
  // `process.nextTick` started throwing recursion errors.
  if (flushing && hasSetImmediate) {
    setImmediate(flush);
  } else {
    process.nextTick(flush);
  }

  if (parentDomain) {
    domain.active = process.domain = parentDomain;
  }
}

var require$$0 = [
  'ac',
  'com.ac',
  'edu.ac',
  'gov.ac',
  'net.ac',
  'mil.ac',
  'org.ac',
  'ad',
  'nom.ad',
  'ae',
  'co.ae',
  'net.ae',
  'org.ae',
  'sch.ae',
  'ac.ae',
  'gov.ae',
  'mil.ae',
  'aero',
  'accident-investigation.aero',
  'accident-prevention.aero',
  'aerobatic.aero',
  'aeroclub.aero',
  'aerodrome.aero',
  'agents.aero',
  'aircraft.aero',
  'airline.aero',
  'airport.aero',
  'air-surveillance.aero',
  'airtraffic.aero',
  'air-traffic-control.aero',
  'ambulance.aero',
  'amusement.aero',
  'association.aero',
  'author.aero',
  'ballooning.aero',
  'broker.aero',
  'caa.aero',
  'cargo.aero',
  'catering.aero',
  'certification.aero',
  'championship.aero',
  'charter.aero',
  'civilaviation.aero',
  'club.aero',
  'conference.aero',
  'consultant.aero',
  'consulting.aero',
  'control.aero',
  'council.aero',
  'crew.aero',
  'design.aero',
  'dgca.aero',
  'educator.aero',
  'emergency.aero',
  'engine.aero',
  'engineer.aero',
  'entertainment.aero',
  'equipment.aero',
  'exchange.aero',
  'express.aero',
  'federation.aero',
  'flight.aero',
  'freight.aero',
  'fuel.aero',
  'gliding.aero',
  'government.aero',
  'groundhandling.aero',
  'group.aero',
  'hanggliding.aero',
  'homebuilt.aero',
  'insurance.aero',
  'journal.aero',
  'journalist.aero',
  'leasing.aero',
  'logistics.aero',
  'magazine.aero',
  'maintenance.aero',
  'media.aero',
  'microlight.aero',
  'modelling.aero',
  'navigation.aero',
  'parachuting.aero',
  'paragliding.aero',
  'passenger-association.aero',
  'pilot.aero',
  'press.aero',
  'production.aero',
  'recreation.aero',
  'repbody.aero',
  'res.aero',
  'research.aero',
  'rotorcraft.aero',
  'safety.aero',
  'scientist.aero',
  'services.aero',
  'show.aero',
  'skydiving.aero',
  'software.aero',
  'student.aero',
  'trader.aero',
  'trading.aero',
  'trainer.aero',
  'union.aero',
  'workinggroup.aero',
  'works.aero',
  'af',
  'gov.af',
  'com.af',
  'org.af',
  'net.af',
  'edu.af',
  'ag',
  'com.ag',
  'org.ag',
  'net.ag',
  'co.ag',
  'nom.ag',
  'ai',
  'off.ai',
  'com.ai',
  'net.ai',
  'org.ai',
  'al',
  'com.al',
  'edu.al',
  'gov.al',
  'mil.al',
  'net.al',
  'org.al',
  'am',
  'co.am',
  'com.am',
  'commune.am',
  'net.am',
  'org.am',
  'ao',
  'ed.ao',
  'gv.ao',
  'og.ao',
  'co.ao',
  'pb.ao',
  'it.ao',
  'aq',
  'ar',
  'com.ar',
  'edu.ar',
  'gob.ar',
  'gov.ar',
  'int.ar',
  'mil.ar',
  'musica.ar',
  'net.ar',
  'org.ar',
  'tur.ar',
  'arpa',
  'e164.arpa',
  'in-addr.arpa',
  'ip6.arpa',
  'iris.arpa',
  'uri.arpa',
  'urn.arpa',
  'as',
  'gov.as',
  'asia',
  'at',
  'ac.at',
  'co.at',
  'gv.at',
  'or.at',
  'au',
  'com.au',
  'net.au',
  'org.au',
  'edu.au',
  'gov.au',
  'asn.au',
  'id.au',
  'info.au',
  'conf.au',
  'oz.au',
  'act.au',
  'nsw.au',
  'nt.au',
  'qld.au',
  'sa.au',
  'tas.au',
  'vic.au',
  'wa.au',
  'act.edu.au',
  'catholic.edu.au',
  'eq.edu.au',
  'nsw.edu.au',
  'nt.edu.au',
  'qld.edu.au',
  'sa.edu.au',
  'tas.edu.au',
  'vic.edu.au',
  'wa.edu.au',
  'qld.gov.au',
  'sa.gov.au',
  'tas.gov.au',
  'vic.gov.au',
  'wa.gov.au',
  'education.tas.edu.au',
  'schools.nsw.edu.au',
  'aw',
  'com.aw',
  'ax',
  'az',
  'com.az',
  'net.az',
  'int.az',
  'gov.az',
  'org.az',
  'edu.az',
  'info.az',
  'pp.az',
  'mil.az',
  'name.az',
  'pro.az',
  'biz.az',
  'ba',
  'com.ba',
  'edu.ba',
  'gov.ba',
  'mil.ba',
  'net.ba',
  'org.ba',
  'bb',
  'biz.bb',
  'co.bb',
  'com.bb',
  'edu.bb',
  'gov.bb',
  'info.bb',
  'net.bb',
  'org.bb',
  'store.bb',
  'tv.bb',
  '*.bd',
  'be',
  'ac.be',
  'bf',
  'gov.bf',
  'bg',
  'a.bg',
  'b.bg',
  'c.bg',
  'd.bg',
  'e.bg',
  'f.bg',
  'g.bg',
  'h.bg',
  'i.bg',
  'j.bg',
  'k.bg',
  'l.bg',
  'm.bg',
  'n.bg',
  'o.bg',
  'p.bg',
  'q.bg',
  'r.bg',
  's.bg',
  't.bg',
  'u.bg',
  'v.bg',
  'w.bg',
  'x.bg',
  'y.bg',
  'z.bg',
  '0.bg',
  '1.bg',
  '2.bg',
  '3.bg',
  '4.bg',
  '5.bg',
  '6.bg',
  '7.bg',
  '8.bg',
  '9.bg',
  'bh',
  'com.bh',
  'edu.bh',
  'net.bh',
  'org.bh',
  'gov.bh',
  'bi',
  'co.bi',
  'com.bi',
  'edu.bi',
  'or.bi',
  'org.bi',
  'biz',
  'bj',
  'asso.bj',
  'barreau.bj',
  'gouv.bj',
  'bm',
  'com.bm',
  'edu.bm',
  'gov.bm',
  'net.bm',
  'org.bm',
  'bn',
  'com.bn',
  'edu.bn',
  'gov.bn',
  'net.bn',
  'org.bn',
  'bo',
  'com.bo',
  'edu.bo',
  'gob.bo',
  'int.bo',
  'org.bo',
  'net.bo',
  'mil.bo',
  'tv.bo',
  'web.bo',
  'academia.bo',
  'agro.bo',
  'arte.bo',
  'blog.bo',
  'bolivia.bo',
  'ciencia.bo',
  'cooperativa.bo',
  'democracia.bo',
  'deporte.bo',
  'ecologia.bo',
  'economia.bo',
  'empresa.bo',
  'indigena.bo',
  'industria.bo',
  'info.bo',
  'medicina.bo',
  'movimiento.bo',
  'musica.bo',
  'natural.bo',
  'nombre.bo',
  'noticias.bo',
  'patria.bo',
  'politica.bo',
  'profesional.bo',
  'plurinacional.bo',
  'pueblo.bo',
  'revista.bo',
  'salud.bo',
  'tecnologia.bo',
  'tksat.bo',
  'transporte.bo',
  'wiki.bo',
  'br',
  '9guacu.br',
  'abc.br',
  'adm.br',
  'adv.br',
  'agr.br',
  'aju.br',
  'am.br',
  'anani.br',
  'aparecida.br',
  'arq.br',
  'art.br',
  'ato.br',
  'b.br',
  'barueri.br',
  'belem.br',
  'bhz.br',
  'bio.br',
  'blog.br',
  'bmd.br',
  'boavista.br',
  'bsb.br',
  'campinagrande.br',
  'campinas.br',
  'caxias.br',
  'cim.br',
  'cng.br',
  'cnt.br',
  'com.br',
  'contagem.br',
  'coop.br',
  'cri.br',
  'cuiaba.br',
  'curitiba.br',
  'def.br',
  'ecn.br',
  'eco.br',
  'edu.br',
  'emp.br',
  'eng.br',
  'esp.br',
  'etc.br',
  'eti.br',
  'far.br',
  'feira.br',
  'flog.br',
  'floripa.br',
  'fm.br',
  'fnd.br',
  'fortal.br',
  'fot.br',
  'foz.br',
  'fst.br',
  'g12.br',
  'ggf.br',
  'goiania.br',
  'gov.br',
  'ac.gov.br',
  'al.gov.br',
  'am.gov.br',
  'ap.gov.br',
  'ba.gov.br',
  'ce.gov.br',
  'df.gov.br',
  'es.gov.br',
  'go.gov.br',
  'ma.gov.br',
  'mg.gov.br',
  'ms.gov.br',
  'mt.gov.br',
  'pa.gov.br',
  'pb.gov.br',
  'pe.gov.br',
  'pi.gov.br',
  'pr.gov.br',
  'rj.gov.br',
  'rn.gov.br',
  'ro.gov.br',
  'rr.gov.br',
  'rs.gov.br',
  'sc.gov.br',
  'se.gov.br',
  'sp.gov.br',
  'to.gov.br',
  'gru.br',
  'imb.br',
  'ind.br',
  'inf.br',
  'jab.br',
  'jampa.br',
  'jdf.br',
  'joinville.br',
  'jor.br',
  'jus.br',
  'leg.br',
  'lel.br',
  'londrina.br',
  'macapa.br',
  'maceio.br',
  'manaus.br',
  'maringa.br',
  'mat.br',
  'med.br',
  'mil.br',
  'morena.br',
  'mp.br',
  'mus.br',
  'natal.br',
  'net.br',
  'niteroi.br',
  '*.nom.br',
  'not.br',
  'ntr.br',
  'odo.br',
  'ong.br',
  'org.br',
  'osasco.br',
  'palmas.br',
  'poa.br',
  'ppg.br',
  'pro.br',
  'psc.br',
  'psi.br',
  'pvh.br',
  'qsl.br',
  'radio.br',
  'rec.br',
  'recife.br',
  'ribeirao.br',
  'rio.br',
  'riobranco.br',
  'riopreto.br',
  'salvador.br',
  'sampa.br',
  'santamaria.br',
  'santoandre.br',
  'saobernardo.br',
  'saogonca.br',
  'sjc.br',
  'slg.br',
  'slz.br',
  'sorocaba.br',
  'srv.br',
  'taxi.br',
  'tc.br',
  'teo.br',
  'the.br',
  'tmp.br',
  'trd.br',
  'tur.br',
  'tv.br',
  'udi.br',
  'vet.br',
  'vix.br',
  'vlog.br',
  'wiki.br',
  'zlg.br',
  'bs',
  'com.bs',
  'net.bs',
  'org.bs',
  'edu.bs',
  'gov.bs',
  'bt',
  'com.bt',
  'edu.bt',
  'gov.bt',
  'net.bt',
  'org.bt',
  'bv',
  'bw',
  'co.bw',
  'org.bw',
  'by',
  'gov.by',
  'mil.by',
  'com.by',
  'of.by',
  'bz',
  'com.bz',
  'net.bz',
  'org.bz',
  'edu.bz',
  'gov.bz',
  'ca',
  'ab.ca',
  'bc.ca',
  'mb.ca',
  'nb.ca',
  'nf.ca',
  'nl.ca',
  'ns.ca',
  'nt.ca',
  'nu.ca',
  'on.ca',
  'pe.ca',
  'qc.ca',
  'sk.ca',
  'yk.ca',
  'gc.ca',
  'cat',
  'cc',
  'cd',
  'gov.cd',
  'cf',
  'cg',
  'ch',
  'ci',
  'org.ci',
  'or.ci',
  'com.ci',
  'co.ci',
  'edu.ci',
  'ed.ci',
  'ac.ci',
  'net.ci',
  'go.ci',
  'asso.ci',
  'aéroport.ci',
  'int.ci',
  'presse.ci',
  'md.ci',
  'gouv.ci',
  '*.ck',
  '!www.ck',
  'cl',
  'gov.cl',
  'gob.cl',
  'co.cl',
  'mil.cl',
  'cm',
  'co.cm',
  'com.cm',
  'gov.cm',
  'net.cm',
  'cn',
  'ac.cn',
  'com.cn',
  'edu.cn',
  'gov.cn',
  'net.cn',
  'org.cn',
  'mil.cn',
  '公司.cn',
  '网络.cn',
  '網絡.cn',
  'ah.cn',
  'bj.cn',
  'cq.cn',
  'fj.cn',
  'gd.cn',
  'gs.cn',
  'gz.cn',
  'gx.cn',
  'ha.cn',
  'hb.cn',
  'he.cn',
  'hi.cn',
  'hl.cn',
  'hn.cn',
  'jl.cn',
  'js.cn',
  'jx.cn',
  'ln.cn',
  'nm.cn',
  'nx.cn',
  'qh.cn',
  'sc.cn',
  'sd.cn',
  'sh.cn',
  'sn.cn',
  'sx.cn',
  'tj.cn',
  'xj.cn',
  'xz.cn',
  'yn.cn',
  'zj.cn',
  'hk.cn',
  'mo.cn',
  'tw.cn',
  'co',
  'arts.co',
  'com.co',
  'edu.co',
  'firm.co',
  'gov.co',
  'info.co',
  'int.co',
  'mil.co',
  'net.co',
  'nom.co',
  'org.co',
  'rec.co',
  'web.co',
  'com',
  'coop',
  'cr',
  'ac.cr',
  'co.cr',
  'ed.cr',
  'fi.cr',
  'go.cr',
  'or.cr',
  'sa.cr',
  'cu',
  'com.cu',
  'edu.cu',
  'org.cu',
  'net.cu',
  'gov.cu',
  'inf.cu',
  'cv',
  'cw',
  'com.cw',
  'edu.cw',
  'net.cw',
  'org.cw',
  'cx',
  'gov.cx',
  'cy',
  'ac.cy',
  'biz.cy',
  'com.cy',
  'ekloges.cy',
  'gov.cy',
  'ltd.cy',
  'name.cy',
  'net.cy',
  'org.cy',
  'parliament.cy',
  'press.cy',
  'pro.cy',
  'tm.cy',
  'cz',
  'de',
  'dj',
  'dk',
  'dm',
  'com.dm',
  'net.dm',
  'org.dm',
  'edu.dm',
  'gov.dm',
  'do',
  'art.do',
  'com.do',
  'edu.do',
  'gob.do',
  'gov.do',
  'mil.do',
  'net.do',
  'org.do',
  'sld.do',
  'web.do',
  'dz',
  'com.dz',
  'org.dz',
  'net.dz',
  'gov.dz',
  'edu.dz',
  'asso.dz',
  'pol.dz',
  'art.dz',
  'ec',
  'com.ec',
  'info.ec',
  'net.ec',
  'fin.ec',
  'k12.ec',
  'med.ec',
  'pro.ec',
  'org.ec',
  'edu.ec',
  'gov.ec',
  'gob.ec',
  'mil.ec',
  'edu',
  'ee',
  'edu.ee',
  'gov.ee',
  'riik.ee',
  'lib.ee',
  'med.ee',
  'com.ee',
  'pri.ee',
  'aip.ee',
  'org.ee',
  'fie.ee',
  'eg',
  'com.eg',
  'edu.eg',
  'eun.eg',
  'gov.eg',
  'mil.eg',
  'name.eg',
  'net.eg',
  'org.eg',
  'sci.eg',
  '*.er',
  'es',
  'com.es',
  'nom.es',
  'org.es',
  'gob.es',
  'edu.es',
  'et',
  'com.et',
  'gov.et',
  'org.et',
  'edu.et',
  'biz.et',
  'name.et',
  'info.et',
  'net.et',
  'eu',
  'fi',
  'aland.fi',
  '*.fj',
  '*.fk',
  'fm',
  'fo',
  'fr',
  'asso.fr',
  'com.fr',
  'gouv.fr',
  'nom.fr',
  'prd.fr',
  'tm.fr',
  'aeroport.fr',
  'avocat.fr',
  'avoues.fr',
  'cci.fr',
  'chambagri.fr',
  'chirurgiens-dentistes.fr',
  'experts-comptables.fr',
  'geometre-expert.fr',
  'greta.fr',
  'huissier-justice.fr',
  'medecin.fr',
  'notaires.fr',
  'pharmacien.fr',
  'port.fr',
  'veterinaire.fr',
  'ga',
  'gb',
  'gd',
  'ge',
  'com.ge',
  'edu.ge',
  'gov.ge',
  'org.ge',
  'mil.ge',
  'net.ge',
  'pvt.ge',
  'gf',
  'gg',
  'co.gg',
  'net.gg',
  'org.gg',
  'gh',
  'com.gh',
  'edu.gh',
  'gov.gh',
  'org.gh',
  'mil.gh',
  'gi',
  'com.gi',
  'ltd.gi',
  'gov.gi',
  'mod.gi',
  'edu.gi',
  'org.gi',
  'gl',
  'co.gl',
  'com.gl',
  'edu.gl',
  'net.gl',
  'org.gl',
  'gm',
  'gn',
  'ac.gn',
  'com.gn',
  'edu.gn',
  'gov.gn',
  'org.gn',
  'net.gn',
  'gov',
  'gp',
  'com.gp',
  'net.gp',
  'mobi.gp',
  'edu.gp',
  'org.gp',
  'asso.gp',
  'gq',
  'gr',
  'com.gr',
  'edu.gr',
  'net.gr',
  'org.gr',
  'gov.gr',
  'gs',
  'gt',
  'com.gt',
  'edu.gt',
  'gob.gt',
  'ind.gt',
  'mil.gt',
  'net.gt',
  'org.gt',
  'gu',
  'com.gu',
  'edu.gu',
  'gov.gu',
  'guam.gu',
  'info.gu',
  'net.gu',
  'org.gu',
  'web.gu',
  'gw',
  'gy',
  'co.gy',
  'com.gy',
  'edu.gy',
  'gov.gy',
  'net.gy',
  'org.gy',
  'hk',
  'com.hk',
  'edu.hk',
  'gov.hk',
  'idv.hk',
  'net.hk',
  'org.hk',
  '公司.hk',
  '教育.hk',
  '敎育.hk',
  '政府.hk',
  '個人.hk',
  '个人.hk',
  '箇人.hk',
  '網络.hk',
  '网络.hk',
  '组織.hk',
  '網絡.hk',
  '网絡.hk',
  '组织.hk',
  '組織.hk',
  '組织.hk',
  'hm',
  'hn',
  'com.hn',
  'edu.hn',
  'org.hn',
  'net.hn',
  'mil.hn',
  'gob.hn',
  'hr',
  'iz.hr',
  'from.hr',
  'name.hr',
  'com.hr',
  'ht',
  'com.ht',
  'shop.ht',
  'firm.ht',
  'info.ht',
  'adult.ht',
  'net.ht',
  'pro.ht',
  'org.ht',
  'med.ht',
  'art.ht',
  'coop.ht',
  'pol.ht',
  'asso.ht',
  'edu.ht',
  'rel.ht',
  'gouv.ht',
  'perso.ht',
  'hu',
  'co.hu',
  'info.hu',
  'org.hu',
  'priv.hu',
  'sport.hu',
  'tm.hu',
  '2000.hu',
  'agrar.hu',
  'bolt.hu',
  'casino.hu',
  'city.hu',
  'erotica.hu',
  'erotika.hu',
  'film.hu',
  'forum.hu',
  'games.hu',
  'hotel.hu',
  'ingatlan.hu',
  'jogasz.hu',
  'konyvelo.hu',
  'lakas.hu',
  'media.hu',
  'news.hu',
  'reklam.hu',
  'sex.hu',
  'shop.hu',
  'suli.hu',
  'szex.hu',
  'tozsde.hu',
  'utazas.hu',
  'video.hu',
  'id',
  'ac.id',
  'biz.id',
  'co.id',
  'desa.id',
  'go.id',
  'mil.id',
  'my.id',
  'net.id',
  'or.id',
  'ponpes.id',
  'sch.id',
  'web.id',
  'ie',
  'gov.ie',
  'il',
  'ac.il',
  'co.il',
  'gov.il',
  'idf.il',
  'k12.il',
  'muni.il',
  'net.il',
  'org.il',
  'im',
  'ac.im',
  'co.im',
  'com.im',
  'ltd.co.im',
  'net.im',
  'org.im',
  'plc.co.im',
  'tt.im',
  'tv.im',
  'in',
  'co.in',
  'firm.in',
  'net.in',
  'org.in',
  'gen.in',
  'ind.in',
  'nic.in',
  'ac.in',
  'edu.in',
  'res.in',
  'gov.in',
  'mil.in',
  'info',
  'int',
  'eu.int',
  'io',
  'com.io',
  'iq',
  'gov.iq',
  'edu.iq',
  'mil.iq',
  'com.iq',
  'org.iq',
  'net.iq',
  'ir',
  'ac.ir',
  'co.ir',
  'gov.ir',
  'id.ir',
  'net.ir',
  'org.ir',
  'sch.ir',
  'ایران.ir',
  'ايران.ir',
  'is',
  'net.is',
  'com.is',
  'edu.is',
  'gov.is',
  'org.is',
  'int.is',
  'it',
  'gov.it',
  'edu.it',
  'abr.it',
  'abruzzo.it',
  'aosta-valley.it',
  'aostavalley.it',
  'bas.it',
  'basilicata.it',
  'cal.it',
  'calabria.it',
  'cam.it',
  'campania.it',
  'emilia-romagna.it',
  'emiliaromagna.it',
  'emr.it',
  'friuli-v-giulia.it',
  'friuli-ve-giulia.it',
  'friuli-vegiulia.it',
  'friuli-venezia-giulia.it',
  'friuli-veneziagiulia.it',
  'friuli-vgiulia.it',
  'friuliv-giulia.it',
  'friulive-giulia.it',
  'friulivegiulia.it',
  'friulivenezia-giulia.it',
  'friuliveneziagiulia.it',
  'friulivgiulia.it',
  'fvg.it',
  'laz.it',
  'lazio.it',
  'lig.it',
  'liguria.it',
  'lom.it',
  'lombardia.it',
  'lombardy.it',
  'lucania.it',
  'mar.it',
  'marche.it',
  'mol.it',
  'molise.it',
  'piedmont.it',
  'piemonte.it',
  'pmn.it',
  'pug.it',
  'puglia.it',
  'sar.it',
  'sardegna.it',
  'sardinia.it',
  'sic.it',
  'sicilia.it',
  'sicily.it',
  'taa.it',
  'tos.it',
  'toscana.it',
  'trentin-sud-tirol.it',
  'trentin-süd-tirol.it',
  'trentin-sudtirol.it',
  'trentin-südtirol.it',
  'trentin-sued-tirol.it',
  'trentin-suedtirol.it',
  'trentino-a-adige.it',
  'trentino-aadige.it',
  'trentino-alto-adige.it',
  'trentino-altoadige.it',
  'trentino-s-tirol.it',
  'trentino-stirol.it',
  'trentino-sud-tirol.it',
  'trentino-süd-tirol.it',
  'trentino-sudtirol.it',
  'trentino-südtirol.it',
  'trentino-sued-tirol.it',
  'trentino-suedtirol.it',
  'trentino.it',
  'trentinoa-adige.it',
  'trentinoaadige.it',
  'trentinoalto-adige.it',
  'trentinoaltoadige.it',
  'trentinos-tirol.it',
  'trentinostirol.it',
  'trentinosud-tirol.it',
  'trentinosüd-tirol.it',
  'trentinosudtirol.it',
  'trentinosüdtirol.it',
  'trentinosued-tirol.it',
  'trentinosuedtirol.it',
  'trentinsud-tirol.it',
  'trentinsüd-tirol.it',
  'trentinsudtirol.it',
  'trentinsüdtirol.it',
  'trentinsued-tirol.it',
  'trentinsuedtirol.it',
  'tuscany.it',
  'umb.it',
  'umbria.it',
  'val-d-aosta.it',
  'val-daosta.it',
  'vald-aosta.it',
  'valdaosta.it',
  'valle-aosta.it',
  'valle-d-aosta.it',
  'valle-daosta.it',
  'valleaosta.it',
  'valled-aosta.it',
  'valledaosta.it',
  'vallee-aoste.it',
  'vallée-aoste.it',
  'vallee-d-aoste.it',
  'vallée-d-aoste.it',
  'valleeaoste.it',
  'valléeaoste.it',
  'valleedaoste.it',
  'valléedaoste.it',
  'vao.it',
  'vda.it',
  'ven.it',
  'veneto.it',
  'ag.it',
  'agrigento.it',
  'al.it',
  'alessandria.it',
  'alto-adige.it',
  'altoadige.it',
  'an.it',
  'ancona.it',
  'andria-barletta-trani.it',
  'andria-trani-barletta.it',
  'andriabarlettatrani.it',
  'andriatranibarletta.it',
  'ao.it',
  'aosta.it',
  'aoste.it',
  'ap.it',
  'aq.it',
  'aquila.it',
  'ar.it',
  'arezzo.it',
  'ascoli-piceno.it',
  'ascolipiceno.it',
  'asti.it',
  'at.it',
  'av.it',
  'avellino.it',
  'ba.it',
  'balsan-sudtirol.it',
  'balsan-südtirol.it',
  'balsan-suedtirol.it',
  'balsan.it',
  'bari.it',
  'barletta-trani-andria.it',
  'barlettatraniandria.it',
  'belluno.it',
  'benevento.it',
  'bergamo.it',
  'bg.it',
  'bi.it',
  'biella.it',
  'bl.it',
  'bn.it',
  'bo.it',
  'bologna.it',
  'bolzano-altoadige.it',
  'bolzano.it',
  'bozen-sudtirol.it',
  'bozen-südtirol.it',
  'bozen-suedtirol.it',
  'bozen.it',
  'br.it',
  'brescia.it',
  'brindisi.it',
  'bs.it',
  'bt.it',
  'bulsan-sudtirol.it',
  'bulsan-südtirol.it',
  'bulsan-suedtirol.it',
  'bulsan.it',
  'bz.it',
  'ca.it',
  'cagliari.it',
  'caltanissetta.it',
  'campidano-medio.it',
  'campidanomedio.it',
  'campobasso.it',
  'carbonia-iglesias.it',
  'carboniaiglesias.it',
  'carrara-massa.it',
  'carraramassa.it',
  'caserta.it',
  'catania.it',
  'catanzaro.it',
  'cb.it',
  'ce.it',
  'cesena-forli.it',
  'cesena-forlì.it',
  'cesenaforli.it',
  'cesenaforlì.it',
  'ch.it',
  'chieti.it',
  'ci.it',
  'cl.it',
  'cn.it',
  'co.it',
  'como.it',
  'cosenza.it',
  'cr.it',
  'cremona.it',
  'crotone.it',
  'cs.it',
  'ct.it',
  'cuneo.it',
  'cz.it',
  'dell-ogliastra.it',
  'dellogliastra.it',
  'en.it',
  'enna.it',
  'fc.it',
  'fe.it',
  'fermo.it',
  'ferrara.it',
  'fg.it',
  'fi.it',
  'firenze.it',
  'florence.it',
  'fm.it',
  'foggia.it',
  'forli-cesena.it',
  'forlì-cesena.it',
  'forlicesena.it',
  'forlìcesena.it',
  'fr.it',
  'frosinone.it',
  'ge.it',
  'genoa.it',
  'genova.it',
  'go.it',
  'gorizia.it',
  'gr.it',
  'grosseto.it',
  'iglesias-carbonia.it',
  'iglesiascarbonia.it',
  'im.it',
  'imperia.it',
  'is.it',
  'isernia.it',
  'kr.it',
  'la-spezia.it',
  'laquila.it',
  'laspezia.it',
  'latina.it',
  'lc.it',
  'le.it',
  'lecce.it',
  'lecco.it',
  'li.it',
  'livorno.it',
  'lo.it',
  'lodi.it',
  'lt.it',
  'lu.it',
  'lucca.it',
  'macerata.it',
  'mantova.it',
  'massa-carrara.it',
  'massacarrara.it',
  'matera.it',
  'mb.it',
  'mc.it',
  'me.it',
  'medio-campidano.it',
  'mediocampidano.it',
  'messina.it',
  'mi.it',
  'milan.it',
  'milano.it',
  'mn.it',
  'mo.it',
  'modena.it',
  'monza-brianza.it',
  'monza-e-della-brianza.it',
  'monza.it',
  'monzabrianza.it',
  'monzaebrianza.it',
  'monzaedellabrianza.it',
  'ms.it',
  'mt.it',
  'na.it',
  'naples.it',
  'napoli.it',
  'no.it',
  'novara.it',
  'nu.it',
  'nuoro.it',
  'og.it',
  'ogliastra.it',
  'olbia-tempio.it',
  'olbiatempio.it',
  'or.it',
  'oristano.it',
  'ot.it',
  'pa.it',
  'padova.it',
  'padua.it',
  'palermo.it',
  'parma.it',
  'pavia.it',
  'pc.it',
  'pd.it',
  'pe.it',
  'perugia.it',
  'pesaro-urbino.it',
  'pesarourbino.it',
  'pescara.it',
  'pg.it',
  'pi.it',
  'piacenza.it',
  'pisa.it',
  'pistoia.it',
  'pn.it',
  'po.it',
  'pordenone.it',
  'potenza.it',
  'pr.it',
  'prato.it',
  'pt.it',
  'pu.it',
  'pv.it',
  'pz.it',
  'ra.it',
  'ragusa.it',
  'ravenna.it',
  'rc.it',
  're.it',
  'reggio-calabria.it',
  'reggio-emilia.it',
  'reggiocalabria.it',
  'reggioemilia.it',
  'rg.it',
  'ri.it',
  'rieti.it',
  'rimini.it',
  'rm.it',
  'rn.it',
  'ro.it',
  'roma.it',
  'rome.it',
  'rovigo.it',
  'sa.it',
  'salerno.it',
  'sassari.it',
  'savona.it',
  'si.it',
  'siena.it',
  'siracusa.it',
  'so.it',
  'sondrio.it',
  'sp.it',
  'sr.it',
  'ss.it',
  'suedtirol.it',
  'südtirol.it',
  'sv.it',
  'ta.it',
  'taranto.it',
  'te.it',
  'tempio-olbia.it',
  'tempioolbia.it',
  'teramo.it',
  'terni.it',
  'tn.it',
  'to.it',
  'torino.it',
  'tp.it',
  'tr.it',
  'trani-andria-barletta.it',
  'trani-barletta-andria.it',
  'traniandriabarletta.it',
  'tranibarlettaandria.it',
  'trapani.it',
  'trento.it',
  'treviso.it',
  'trieste.it',
  'ts.it',
  'turin.it',
  'tv.it',
  'ud.it',
  'udine.it',
  'urbino-pesaro.it',
  'urbinopesaro.it',
  'va.it',
  'varese.it',
  'vb.it',
  'vc.it',
  've.it',
  'venezia.it',
  'venice.it',
  'verbania.it',
  'vercelli.it',
  'verona.it',
  'vi.it',
  'vibo-valentia.it',
  'vibovalentia.it',
  'vicenza.it',
  'viterbo.it',
  'vr.it',
  'vs.it',
  'vt.it',
  'vv.it',
  'je',
  'co.je',
  'net.je',
  'org.je',
  '*.jm',
  'jo',
  'com.jo',
  'org.jo',
  'net.jo',
  'edu.jo',
  'sch.jo',
  'gov.jo',
  'mil.jo',
  'name.jo',
  'jobs',
  'jp',
  'ac.jp',
  'ad.jp',
  'co.jp',
  'ed.jp',
  'go.jp',
  'gr.jp',
  'lg.jp',
  'ne.jp',
  'or.jp',
  'aichi.jp',
  'akita.jp',
  'aomori.jp',
  'chiba.jp',
  'ehime.jp',
  'fukui.jp',
  'fukuoka.jp',
  'fukushima.jp',
  'gifu.jp',
  'gunma.jp',
  'hiroshima.jp',
  'hokkaido.jp',
  'hyogo.jp',
  'ibaraki.jp',
  'ishikawa.jp',
  'iwate.jp',
  'kagawa.jp',
  'kagoshima.jp',
  'kanagawa.jp',
  'kochi.jp',
  'kumamoto.jp',
  'kyoto.jp',
  'mie.jp',
  'miyagi.jp',
  'miyazaki.jp',
  'nagano.jp',
  'nagasaki.jp',
  'nara.jp',
  'niigata.jp',
  'oita.jp',
  'okayama.jp',
  'okinawa.jp',
  'osaka.jp',
  'saga.jp',
  'saitama.jp',
  'shiga.jp',
  'shimane.jp',
  'shizuoka.jp',
  'tochigi.jp',
  'tokushima.jp',
  'tokyo.jp',
  'tottori.jp',
  'toyama.jp',
  'wakayama.jp',
  'yamagata.jp',
  'yamaguchi.jp',
  'yamanashi.jp',
  '栃木.jp',
  '愛知.jp',
  '愛媛.jp',
  '兵庫.jp',
  '熊本.jp',
  '茨城.jp',
  '北海道.jp',
  '千葉.jp',
  '和歌山.jp',
  '長崎.jp',
  '長野.jp',
  '新潟.jp',
  '青森.jp',
  '静岡.jp',
  '東京.jp',
  '石川.jp',
  '埼玉.jp',
  '三重.jp',
  '京都.jp',
  '佐賀.jp',
  '大分.jp',
  '大阪.jp',
  '奈良.jp',
  '宮城.jp',
  '宮崎.jp',
  '富山.jp',
  '山口.jp',
  '山形.jp',
  '山梨.jp',
  '岩手.jp',
  '岐阜.jp',
  '岡山.jp',
  '島根.jp',
  '広島.jp',
  '徳島.jp',
  '沖縄.jp',
  '滋賀.jp',
  '神奈川.jp',
  '福井.jp',
  '福岡.jp',
  '福島.jp',
  '秋田.jp',
  '群馬.jp',
  '香川.jp',
  '高知.jp',
  '鳥取.jp',
  '鹿児島.jp',
  '*.kawasaki.jp',
  '*.kitakyushu.jp',
  '*.kobe.jp',
  '*.nagoya.jp',
  '*.sapporo.jp',
  '*.sendai.jp',
  '*.yokohama.jp',
  '!city.kawasaki.jp',
  '!city.kitakyushu.jp',
  '!city.kobe.jp',
  '!city.nagoya.jp',
  '!city.sapporo.jp',
  '!city.sendai.jp',
  '!city.yokohama.jp',
  'aisai.aichi.jp',
  'ama.aichi.jp',
  'anjo.aichi.jp',
  'asuke.aichi.jp',
  'chiryu.aichi.jp',
  'chita.aichi.jp',
  'fuso.aichi.jp',
  'gamagori.aichi.jp',
  'handa.aichi.jp',
  'hazu.aichi.jp',
  'hekinan.aichi.jp',
  'higashiura.aichi.jp',
  'ichinomiya.aichi.jp',
  'inazawa.aichi.jp',
  'inuyama.aichi.jp',
  'isshiki.aichi.jp',
  'iwakura.aichi.jp',
  'kanie.aichi.jp',
  'kariya.aichi.jp',
  'kasugai.aichi.jp',
  'kira.aichi.jp',
  'kiyosu.aichi.jp',
  'komaki.aichi.jp',
  'konan.aichi.jp',
  'kota.aichi.jp',
  'mihama.aichi.jp',
  'miyoshi.aichi.jp',
  'nishio.aichi.jp',
  'nisshin.aichi.jp',
  'obu.aichi.jp',
  'oguchi.aichi.jp',
  'oharu.aichi.jp',
  'okazaki.aichi.jp',
  'owariasahi.aichi.jp',
  'seto.aichi.jp',
  'shikatsu.aichi.jp',
  'shinshiro.aichi.jp',
  'shitara.aichi.jp',
  'tahara.aichi.jp',
  'takahama.aichi.jp',
  'tobishima.aichi.jp',
  'toei.aichi.jp',
  'togo.aichi.jp',
  'tokai.aichi.jp',
  'tokoname.aichi.jp',
  'toyoake.aichi.jp',
  'toyohashi.aichi.jp',
  'toyokawa.aichi.jp',
  'toyone.aichi.jp',
  'toyota.aichi.jp',
  'tsushima.aichi.jp',
  'yatomi.aichi.jp',
  'akita.akita.jp',
  'daisen.akita.jp',
  'fujisato.akita.jp',
  'gojome.akita.jp',
  'hachirogata.akita.jp',
  'happou.akita.jp',
  'higashinaruse.akita.jp',
  'honjo.akita.jp',
  'honjyo.akita.jp',
  'ikawa.akita.jp',
  'kamikoani.akita.jp',
  'kamioka.akita.jp',
  'katagami.akita.jp',
  'kazuno.akita.jp',
  'kitaakita.akita.jp',
  'kosaka.akita.jp',
  'kyowa.akita.jp',
  'misato.akita.jp',
  'mitane.akita.jp',
  'moriyoshi.akita.jp',
  'nikaho.akita.jp',
  'noshiro.akita.jp',
  'odate.akita.jp',
  'oga.akita.jp',
  'ogata.akita.jp',
  'semboku.akita.jp',
  'yokote.akita.jp',
  'yurihonjo.akita.jp',
  'aomori.aomori.jp',
  'gonohe.aomori.jp',
  'hachinohe.aomori.jp',
  'hashikami.aomori.jp',
  'hiranai.aomori.jp',
  'hirosaki.aomori.jp',
  'itayanagi.aomori.jp',
  'kuroishi.aomori.jp',
  'misawa.aomori.jp',
  'mutsu.aomori.jp',
  'nakadomari.aomori.jp',
  'noheji.aomori.jp',
  'oirase.aomori.jp',
  'owani.aomori.jp',
  'rokunohe.aomori.jp',
  'sannohe.aomori.jp',
  'shichinohe.aomori.jp',
  'shingo.aomori.jp',
  'takko.aomori.jp',
  'towada.aomori.jp',
  'tsugaru.aomori.jp',
  'tsuruta.aomori.jp',
  'abiko.chiba.jp',
  'asahi.chiba.jp',
  'chonan.chiba.jp',
  'chosei.chiba.jp',
  'choshi.chiba.jp',
  'chuo.chiba.jp',
  'funabashi.chiba.jp',
  'futtsu.chiba.jp',
  'hanamigawa.chiba.jp',
  'ichihara.chiba.jp',
  'ichikawa.chiba.jp',
  'ichinomiya.chiba.jp',
  'inzai.chiba.jp',
  'isumi.chiba.jp',
  'kamagaya.chiba.jp',
  'kamogawa.chiba.jp',
  'kashiwa.chiba.jp',
  'katori.chiba.jp',
  'katsuura.chiba.jp',
  'kimitsu.chiba.jp',
  'kisarazu.chiba.jp',
  'kozaki.chiba.jp',
  'kujukuri.chiba.jp',
  'kyonan.chiba.jp',
  'matsudo.chiba.jp',
  'midori.chiba.jp',
  'mihama.chiba.jp',
  'minamiboso.chiba.jp',
  'mobara.chiba.jp',
  'mutsuzawa.chiba.jp',
  'nagara.chiba.jp',
  'nagareyama.chiba.jp',
  'narashino.chiba.jp',
  'narita.chiba.jp',
  'noda.chiba.jp',
  'oamishirasato.chiba.jp',
  'omigawa.chiba.jp',
  'onjuku.chiba.jp',
  'otaki.chiba.jp',
  'sakae.chiba.jp',
  'sakura.chiba.jp',
  'shimofusa.chiba.jp',
  'shirako.chiba.jp',
  'shiroi.chiba.jp',
  'shisui.chiba.jp',
  'sodegaura.chiba.jp',
  'sosa.chiba.jp',
  'tako.chiba.jp',
  'tateyama.chiba.jp',
  'togane.chiba.jp',
  'tohnosho.chiba.jp',
  'tomisato.chiba.jp',
  'urayasu.chiba.jp',
  'yachimata.chiba.jp',
  'yachiyo.chiba.jp',
  'yokaichiba.chiba.jp',
  'yokoshibahikari.chiba.jp',
  'yotsukaido.chiba.jp',
  'ainan.ehime.jp',
  'honai.ehime.jp',
  'ikata.ehime.jp',
  'imabari.ehime.jp',
  'iyo.ehime.jp',
  'kamijima.ehime.jp',
  'kihoku.ehime.jp',
  'kumakogen.ehime.jp',
  'masaki.ehime.jp',
  'matsuno.ehime.jp',
  'matsuyama.ehime.jp',
  'namikata.ehime.jp',
  'niihama.ehime.jp',
  'ozu.ehime.jp',
  'saijo.ehime.jp',
  'seiyo.ehime.jp',
  'shikokuchuo.ehime.jp',
  'tobe.ehime.jp',
  'toon.ehime.jp',
  'uchiko.ehime.jp',
  'uwajima.ehime.jp',
  'yawatahama.ehime.jp',
  'echizen.fukui.jp',
  'eiheiji.fukui.jp',
  'fukui.fukui.jp',
  'ikeda.fukui.jp',
  'katsuyama.fukui.jp',
  'mihama.fukui.jp',
  'minamiechizen.fukui.jp',
  'obama.fukui.jp',
  'ohi.fukui.jp',
  'ono.fukui.jp',
  'sabae.fukui.jp',
  'sakai.fukui.jp',
  'takahama.fukui.jp',
  'tsuruga.fukui.jp',
  'wakasa.fukui.jp',
  'ashiya.fukuoka.jp',
  'buzen.fukuoka.jp',
  'chikugo.fukuoka.jp',
  'chikuho.fukuoka.jp',
  'chikujo.fukuoka.jp',
  'chikushino.fukuoka.jp',
  'chikuzen.fukuoka.jp',
  'chuo.fukuoka.jp',
  'dazaifu.fukuoka.jp',
  'fukuchi.fukuoka.jp',
  'hakata.fukuoka.jp',
  'higashi.fukuoka.jp',
  'hirokawa.fukuoka.jp',
  'hisayama.fukuoka.jp',
  'iizuka.fukuoka.jp',
  'inatsuki.fukuoka.jp',
  'kaho.fukuoka.jp',
  'kasuga.fukuoka.jp',
  'kasuya.fukuoka.jp',
  'kawara.fukuoka.jp',
  'keisen.fukuoka.jp',
  'koga.fukuoka.jp',
  'kurate.fukuoka.jp',
  'kurogi.fukuoka.jp',
  'kurume.fukuoka.jp',
  'minami.fukuoka.jp',
  'miyako.fukuoka.jp',
  'miyama.fukuoka.jp',
  'miyawaka.fukuoka.jp',
  'mizumaki.fukuoka.jp',
  'munakata.fukuoka.jp',
  'nakagawa.fukuoka.jp',
  'nakama.fukuoka.jp',
  'nishi.fukuoka.jp',
  'nogata.fukuoka.jp',
  'ogori.fukuoka.jp',
  'okagaki.fukuoka.jp',
  'okawa.fukuoka.jp',
  'oki.fukuoka.jp',
  'omuta.fukuoka.jp',
  'onga.fukuoka.jp',
  'onojo.fukuoka.jp',
  'oto.fukuoka.jp',
  'saigawa.fukuoka.jp',
  'sasaguri.fukuoka.jp',
  'shingu.fukuoka.jp',
  'shinyoshitomi.fukuoka.jp',
  'shonai.fukuoka.jp',
  'soeda.fukuoka.jp',
  'sue.fukuoka.jp',
  'tachiarai.fukuoka.jp',
  'tagawa.fukuoka.jp',
  'takata.fukuoka.jp',
  'toho.fukuoka.jp',
  'toyotsu.fukuoka.jp',
  'tsuiki.fukuoka.jp',
  'ukiha.fukuoka.jp',
  'umi.fukuoka.jp',
  'usui.fukuoka.jp',
  'yamada.fukuoka.jp',
  'yame.fukuoka.jp',
  'yanagawa.fukuoka.jp',
  'yukuhashi.fukuoka.jp',
  'aizubange.fukushima.jp',
  'aizumisato.fukushima.jp',
  'aizuwakamatsu.fukushima.jp',
  'asakawa.fukushima.jp',
  'bandai.fukushima.jp',
  'date.fukushima.jp',
  'fukushima.fukushima.jp',
  'furudono.fukushima.jp',
  'futaba.fukushima.jp',
  'hanawa.fukushima.jp',
  'higashi.fukushima.jp',
  'hirata.fukushima.jp',
  'hirono.fukushima.jp',
  'iitate.fukushima.jp',
  'inawashiro.fukushima.jp',
  'ishikawa.fukushima.jp',
  'iwaki.fukushima.jp',
  'izumizaki.fukushima.jp',
  'kagamiishi.fukushima.jp',
  'kaneyama.fukushima.jp',
  'kawamata.fukushima.jp',
  'kitakata.fukushima.jp',
  'kitashiobara.fukushima.jp',
  'koori.fukushima.jp',
  'koriyama.fukushima.jp',
  'kunimi.fukushima.jp',
  'miharu.fukushima.jp',
  'mishima.fukushima.jp',
  'namie.fukushima.jp',
  'nango.fukushima.jp',
  'nishiaizu.fukushima.jp',
  'nishigo.fukushima.jp',
  'okuma.fukushima.jp',
  'omotego.fukushima.jp',
  'ono.fukushima.jp',
  'otama.fukushima.jp',
  'samegawa.fukushima.jp',
  'shimogo.fukushima.jp',
  'shirakawa.fukushima.jp',
  'showa.fukushima.jp',
  'soma.fukushima.jp',
  'sukagawa.fukushima.jp',
  'taishin.fukushima.jp',
  'tamakawa.fukushima.jp',
  'tanagura.fukushima.jp',
  'tenei.fukushima.jp',
  'yabuki.fukushima.jp',
  'yamato.fukushima.jp',
  'yamatsuri.fukushima.jp',
  'yanaizu.fukushima.jp',
  'yugawa.fukushima.jp',
  'anpachi.gifu.jp',
  'ena.gifu.jp',
  'gifu.gifu.jp',
  'ginan.gifu.jp',
  'godo.gifu.jp',
  'gujo.gifu.jp',
  'hashima.gifu.jp',
  'hichiso.gifu.jp',
  'hida.gifu.jp',
  'higashishirakawa.gifu.jp',
  'ibigawa.gifu.jp',
  'ikeda.gifu.jp',
  'kakamigahara.gifu.jp',
  'kani.gifu.jp',
  'kasahara.gifu.jp',
  'kasamatsu.gifu.jp',
  'kawaue.gifu.jp',
  'kitagata.gifu.jp',
  'mino.gifu.jp',
  'minokamo.gifu.jp',
  'mitake.gifu.jp',
  'mizunami.gifu.jp',
  'motosu.gifu.jp',
  'nakatsugawa.gifu.jp',
  'ogaki.gifu.jp',
  'sakahogi.gifu.jp',
  'seki.gifu.jp',
  'sekigahara.gifu.jp',
  'shirakawa.gifu.jp',
  'tajimi.gifu.jp',
  'takayama.gifu.jp',
  'tarui.gifu.jp',
  'toki.gifu.jp',
  'tomika.gifu.jp',
  'wanouchi.gifu.jp',
  'yamagata.gifu.jp',
  'yaotsu.gifu.jp',
  'yoro.gifu.jp',
  'annaka.gunma.jp',
  'chiyoda.gunma.jp',
  'fujioka.gunma.jp',
  'higashiagatsuma.gunma.jp',
  'isesaki.gunma.jp',
  'itakura.gunma.jp',
  'kanna.gunma.jp',
  'kanra.gunma.jp',
  'katashina.gunma.jp',
  'kawaba.gunma.jp',
  'kiryu.gunma.jp',
  'kusatsu.gunma.jp',
  'maebashi.gunma.jp',
  'meiwa.gunma.jp',
  'midori.gunma.jp',
  'minakami.gunma.jp',
  'naganohara.gunma.jp',
  'nakanojo.gunma.jp',
  'nanmoku.gunma.jp',
  'numata.gunma.jp',
  'oizumi.gunma.jp',
  'ora.gunma.jp',
  'ota.gunma.jp',
  'shibukawa.gunma.jp',
  'shimonita.gunma.jp',
  'shinto.gunma.jp',
  'showa.gunma.jp',
  'takasaki.gunma.jp',
  'takayama.gunma.jp',
  'tamamura.gunma.jp',
  'tatebayashi.gunma.jp',
  'tomioka.gunma.jp',
  'tsukiyono.gunma.jp',
  'tsumagoi.gunma.jp',
  'ueno.gunma.jp',
  'yoshioka.gunma.jp',
  'asaminami.hiroshima.jp',
  'daiwa.hiroshima.jp',
  'etajima.hiroshima.jp',
  'fuchu.hiroshima.jp',
  'fukuyama.hiroshima.jp',
  'hatsukaichi.hiroshima.jp',
  'higashihiroshima.hiroshima.jp',
  'hongo.hiroshima.jp',
  'jinsekikogen.hiroshima.jp',
  'kaita.hiroshima.jp',
  'kui.hiroshima.jp',
  'kumano.hiroshima.jp',
  'kure.hiroshima.jp',
  'mihara.hiroshima.jp',
  'miyoshi.hiroshima.jp',
  'naka.hiroshima.jp',
  'onomichi.hiroshima.jp',
  'osakikamijima.hiroshima.jp',
  'otake.hiroshima.jp',
  'saka.hiroshima.jp',
  'sera.hiroshima.jp',
  'seranishi.hiroshima.jp',
  'shinichi.hiroshima.jp',
  'shobara.hiroshima.jp',
  'takehara.hiroshima.jp',
  'abashiri.hokkaido.jp',
  'abira.hokkaido.jp',
  'aibetsu.hokkaido.jp',
  'akabira.hokkaido.jp',
  'akkeshi.hokkaido.jp',
  'asahikawa.hokkaido.jp',
  'ashibetsu.hokkaido.jp',
  'ashoro.hokkaido.jp',
  'assabu.hokkaido.jp',
  'atsuma.hokkaido.jp',
  'bibai.hokkaido.jp',
  'biei.hokkaido.jp',
  'bifuka.hokkaido.jp',
  'bihoro.hokkaido.jp',
  'biratori.hokkaido.jp',
  'chippubetsu.hokkaido.jp',
  'chitose.hokkaido.jp',
  'date.hokkaido.jp',
  'ebetsu.hokkaido.jp',
  'embetsu.hokkaido.jp',
  'eniwa.hokkaido.jp',
  'erimo.hokkaido.jp',
  'esan.hokkaido.jp',
  'esashi.hokkaido.jp',
  'fukagawa.hokkaido.jp',
  'fukushima.hokkaido.jp',
  'furano.hokkaido.jp',
  'furubira.hokkaido.jp',
  'haboro.hokkaido.jp',
  'hakodate.hokkaido.jp',
  'hamatonbetsu.hokkaido.jp',
  'hidaka.hokkaido.jp',
  'higashikagura.hokkaido.jp',
  'higashikawa.hokkaido.jp',
  'hiroo.hokkaido.jp',
  'hokuryu.hokkaido.jp',
  'hokuto.hokkaido.jp',
  'honbetsu.hokkaido.jp',
  'horokanai.hokkaido.jp',
  'horonobe.hokkaido.jp',
  'ikeda.hokkaido.jp',
  'imakane.hokkaido.jp',
  'ishikari.hokkaido.jp',
  'iwamizawa.hokkaido.jp',
  'iwanai.hokkaido.jp',
  'kamifurano.hokkaido.jp',
  'kamikawa.hokkaido.jp',
  'kamishihoro.hokkaido.jp',
  'kamisunagawa.hokkaido.jp',
  'kamoenai.hokkaido.jp',
  'kayabe.hokkaido.jp',
  'kembuchi.hokkaido.jp',
  'kikonai.hokkaido.jp',
  'kimobetsu.hokkaido.jp',
  'kitahiroshima.hokkaido.jp',
  'kitami.hokkaido.jp',
  'kiyosato.hokkaido.jp',
  'koshimizu.hokkaido.jp',
  'kunneppu.hokkaido.jp',
  'kuriyama.hokkaido.jp',
  'kuromatsunai.hokkaido.jp',
  'kushiro.hokkaido.jp',
  'kutchan.hokkaido.jp',
  'kyowa.hokkaido.jp',
  'mashike.hokkaido.jp',
  'matsumae.hokkaido.jp',
  'mikasa.hokkaido.jp',
  'minamifurano.hokkaido.jp',
  'mombetsu.hokkaido.jp',
  'moseushi.hokkaido.jp',
  'mukawa.hokkaido.jp',
  'muroran.hokkaido.jp',
  'naie.hokkaido.jp',
  'nakagawa.hokkaido.jp',
  'nakasatsunai.hokkaido.jp',
  'nakatombetsu.hokkaido.jp',
  'nanae.hokkaido.jp',
  'nanporo.hokkaido.jp',
  'nayoro.hokkaido.jp',
  'nemuro.hokkaido.jp',
  'niikappu.hokkaido.jp',
  'niki.hokkaido.jp',
  'nishiokoppe.hokkaido.jp',
  'noboribetsu.hokkaido.jp',
  'numata.hokkaido.jp',
  'obihiro.hokkaido.jp',
  'obira.hokkaido.jp',
  'oketo.hokkaido.jp',
  'okoppe.hokkaido.jp',
  'otaru.hokkaido.jp',
  'otobe.hokkaido.jp',
  'otofuke.hokkaido.jp',
  'otoineppu.hokkaido.jp',
  'oumu.hokkaido.jp',
  'ozora.hokkaido.jp',
  'pippu.hokkaido.jp',
  'rankoshi.hokkaido.jp',
  'rebun.hokkaido.jp',
  'rikubetsu.hokkaido.jp',
  'rishiri.hokkaido.jp',
  'rishirifuji.hokkaido.jp',
  'saroma.hokkaido.jp',
  'sarufutsu.hokkaido.jp',
  'shakotan.hokkaido.jp',
  'shari.hokkaido.jp',
  'shibecha.hokkaido.jp',
  'shibetsu.hokkaido.jp',
  'shikabe.hokkaido.jp',
  'shikaoi.hokkaido.jp',
  'shimamaki.hokkaido.jp',
  'shimizu.hokkaido.jp',
  'shimokawa.hokkaido.jp',
  'shinshinotsu.hokkaido.jp',
  'shintoku.hokkaido.jp',
  'shiranuka.hokkaido.jp',
  'shiraoi.hokkaido.jp',
  'shiriuchi.hokkaido.jp',
  'sobetsu.hokkaido.jp',
  'sunagawa.hokkaido.jp',
  'taiki.hokkaido.jp',
  'takasu.hokkaido.jp',
  'takikawa.hokkaido.jp',
  'takinoue.hokkaido.jp',
  'teshikaga.hokkaido.jp',
  'tobetsu.hokkaido.jp',
  'tohma.hokkaido.jp',
  'tomakomai.hokkaido.jp',
  'tomari.hokkaido.jp',
  'toya.hokkaido.jp',
  'toyako.hokkaido.jp',
  'toyotomi.hokkaido.jp',
  'toyoura.hokkaido.jp',
  'tsubetsu.hokkaido.jp',
  'tsukigata.hokkaido.jp',
  'urakawa.hokkaido.jp',
  'urausu.hokkaido.jp',
  'uryu.hokkaido.jp',
  'utashinai.hokkaido.jp',
  'wakkanai.hokkaido.jp',
  'wassamu.hokkaido.jp',
  'yakumo.hokkaido.jp',
  'yoichi.hokkaido.jp',
  'aioi.hyogo.jp',
  'akashi.hyogo.jp',
  'ako.hyogo.jp',
  'amagasaki.hyogo.jp',
  'aogaki.hyogo.jp',
  'asago.hyogo.jp',
  'ashiya.hyogo.jp',
  'awaji.hyogo.jp',
  'fukusaki.hyogo.jp',
  'goshiki.hyogo.jp',
  'harima.hyogo.jp',
  'himeji.hyogo.jp',
  'ichikawa.hyogo.jp',
  'inagawa.hyogo.jp',
  'itami.hyogo.jp',
  'kakogawa.hyogo.jp',
  'kamigori.hyogo.jp',
  'kamikawa.hyogo.jp',
  'kasai.hyogo.jp',
  'kasuga.hyogo.jp',
  'kawanishi.hyogo.jp',
  'miki.hyogo.jp',
  'minamiawaji.hyogo.jp',
  'nishinomiya.hyogo.jp',
  'nishiwaki.hyogo.jp',
  'ono.hyogo.jp',
  'sanda.hyogo.jp',
  'sannan.hyogo.jp',
  'sasayama.hyogo.jp',
  'sayo.hyogo.jp',
  'shingu.hyogo.jp',
  'shinonsen.hyogo.jp',
  'shiso.hyogo.jp',
  'sumoto.hyogo.jp',
  'taishi.hyogo.jp',
  'taka.hyogo.jp',
  'takarazuka.hyogo.jp',
  'takasago.hyogo.jp',
  'takino.hyogo.jp',
  'tamba.hyogo.jp',
  'tatsuno.hyogo.jp',
  'toyooka.hyogo.jp',
  'yabu.hyogo.jp',
  'yashiro.hyogo.jp',
  'yoka.hyogo.jp',
  'yokawa.hyogo.jp',
  'ami.ibaraki.jp',
  'asahi.ibaraki.jp',
  'bando.ibaraki.jp',
  'chikusei.ibaraki.jp',
  'daigo.ibaraki.jp',
  'fujishiro.ibaraki.jp',
  'hitachi.ibaraki.jp',
  'hitachinaka.ibaraki.jp',
  'hitachiomiya.ibaraki.jp',
  'hitachiota.ibaraki.jp',
  'ibaraki.ibaraki.jp',
  'ina.ibaraki.jp',
  'inashiki.ibaraki.jp',
  'itako.ibaraki.jp',
  'iwama.ibaraki.jp',
  'joso.ibaraki.jp',
  'kamisu.ibaraki.jp',
  'kasama.ibaraki.jp',
  'kashima.ibaraki.jp',
  'kasumigaura.ibaraki.jp',
  'koga.ibaraki.jp',
  'miho.ibaraki.jp',
  'mito.ibaraki.jp',
  'moriya.ibaraki.jp',
  'naka.ibaraki.jp',
  'namegata.ibaraki.jp',
  'oarai.ibaraki.jp',
  'ogawa.ibaraki.jp',
  'omitama.ibaraki.jp',
  'ryugasaki.ibaraki.jp',
  'sakai.ibaraki.jp',
  'sakuragawa.ibaraki.jp',
  'shimodate.ibaraki.jp',
  'shimotsuma.ibaraki.jp',
  'shirosato.ibaraki.jp',
  'sowa.ibaraki.jp',
  'suifu.ibaraki.jp',
  'takahagi.ibaraki.jp',
  'tamatsukuri.ibaraki.jp',
  'tokai.ibaraki.jp',
  'tomobe.ibaraki.jp',
  'tone.ibaraki.jp',
  'toride.ibaraki.jp',
  'tsuchiura.ibaraki.jp',
  'tsukuba.ibaraki.jp',
  'uchihara.ibaraki.jp',
  'ushiku.ibaraki.jp',
  'yachiyo.ibaraki.jp',
  'yamagata.ibaraki.jp',
  'yawara.ibaraki.jp',
  'yuki.ibaraki.jp',
  'anamizu.ishikawa.jp',
  'hakui.ishikawa.jp',
  'hakusan.ishikawa.jp',
  'kaga.ishikawa.jp',
  'kahoku.ishikawa.jp',
  'kanazawa.ishikawa.jp',
  'kawakita.ishikawa.jp',
  'komatsu.ishikawa.jp',
  'nakanoto.ishikawa.jp',
  'nanao.ishikawa.jp',
  'nomi.ishikawa.jp',
  'nonoichi.ishikawa.jp',
  'noto.ishikawa.jp',
  'shika.ishikawa.jp',
  'suzu.ishikawa.jp',
  'tsubata.ishikawa.jp',
  'tsurugi.ishikawa.jp',
  'uchinada.ishikawa.jp',
  'wajima.ishikawa.jp',
  'fudai.iwate.jp',
  'fujisawa.iwate.jp',
  'hanamaki.iwate.jp',
  'hiraizumi.iwate.jp',
  'hirono.iwate.jp',
  'ichinohe.iwate.jp',
  'ichinoseki.iwate.jp',
  'iwaizumi.iwate.jp',
  'iwate.iwate.jp',
  'joboji.iwate.jp',
  'kamaishi.iwate.jp',
  'kanegasaki.iwate.jp',
  'karumai.iwate.jp',
  'kawai.iwate.jp',
  'kitakami.iwate.jp',
  'kuji.iwate.jp',
  'kunohe.iwate.jp',
  'kuzumaki.iwate.jp',
  'miyako.iwate.jp',
  'mizusawa.iwate.jp',
  'morioka.iwate.jp',
  'ninohe.iwate.jp',
  'noda.iwate.jp',
  'ofunato.iwate.jp',
  'oshu.iwate.jp',
  'otsuchi.iwate.jp',
  'rikuzentakata.iwate.jp',
  'shiwa.iwate.jp',
  'shizukuishi.iwate.jp',
  'sumita.iwate.jp',
  'tanohata.iwate.jp',
  'tono.iwate.jp',
  'yahaba.iwate.jp',
  'yamada.iwate.jp',
  'ayagawa.kagawa.jp',
  'higashikagawa.kagawa.jp',
  'kanonji.kagawa.jp',
  'kotohira.kagawa.jp',
  'manno.kagawa.jp',
  'marugame.kagawa.jp',
  'mitoyo.kagawa.jp',
  'naoshima.kagawa.jp',
  'sanuki.kagawa.jp',
  'tadotsu.kagawa.jp',
  'takamatsu.kagawa.jp',
  'tonosho.kagawa.jp',
  'uchinomi.kagawa.jp',
  'utazu.kagawa.jp',
  'zentsuji.kagawa.jp',
  'akune.kagoshima.jp',
  'amami.kagoshima.jp',
  'hioki.kagoshima.jp',
  'isa.kagoshima.jp',
  'isen.kagoshima.jp',
  'izumi.kagoshima.jp',
  'kagoshima.kagoshima.jp',
  'kanoya.kagoshima.jp',
  'kawanabe.kagoshima.jp',
  'kinko.kagoshima.jp',
  'kouyama.kagoshima.jp',
  'makurazaki.kagoshima.jp',
  'matsumoto.kagoshima.jp',
  'minamitane.kagoshima.jp',
  'nakatane.kagoshima.jp',
  'nishinoomote.kagoshima.jp',
  'satsumasendai.kagoshima.jp',
  'soo.kagoshima.jp',
  'tarumizu.kagoshima.jp',
  'yusui.kagoshima.jp',
  'aikawa.kanagawa.jp',
  'atsugi.kanagawa.jp',
  'ayase.kanagawa.jp',
  'chigasaki.kanagawa.jp',
  'ebina.kanagawa.jp',
  'fujisawa.kanagawa.jp',
  'hadano.kanagawa.jp',
  'hakone.kanagawa.jp',
  'hiratsuka.kanagawa.jp',
  'isehara.kanagawa.jp',
  'kaisei.kanagawa.jp',
  'kamakura.kanagawa.jp',
  'kiyokawa.kanagawa.jp',
  'matsuda.kanagawa.jp',
  'minamiashigara.kanagawa.jp',
  'miura.kanagawa.jp',
  'nakai.kanagawa.jp',
  'ninomiya.kanagawa.jp',
  'odawara.kanagawa.jp',
  'oi.kanagawa.jp',
  'oiso.kanagawa.jp',
  'sagamihara.kanagawa.jp',
  'samukawa.kanagawa.jp',
  'tsukui.kanagawa.jp',
  'yamakita.kanagawa.jp',
  'yamato.kanagawa.jp',
  'yokosuka.kanagawa.jp',
  'yugawara.kanagawa.jp',
  'zama.kanagawa.jp',
  'zushi.kanagawa.jp',
  'aki.kochi.jp',
  'geisei.kochi.jp',
  'hidaka.kochi.jp',
  'higashitsuno.kochi.jp',
  'ino.kochi.jp',
  'kagami.kochi.jp',
  'kami.kochi.jp',
  'kitagawa.kochi.jp',
  'kochi.kochi.jp',
  'mihara.kochi.jp',
  'motoyama.kochi.jp',
  'muroto.kochi.jp',
  'nahari.kochi.jp',
  'nakamura.kochi.jp',
  'nankoku.kochi.jp',
  'nishitosa.kochi.jp',
  'niyodogawa.kochi.jp',
  'ochi.kochi.jp',
  'okawa.kochi.jp',
  'otoyo.kochi.jp',
  'otsuki.kochi.jp',
  'sakawa.kochi.jp',
  'sukumo.kochi.jp',
  'susaki.kochi.jp',
  'tosa.kochi.jp',
  'tosashimizu.kochi.jp',
  'toyo.kochi.jp',
  'tsuno.kochi.jp',
  'umaji.kochi.jp',
  'yasuda.kochi.jp',
  'yusuhara.kochi.jp',
  'amakusa.kumamoto.jp',
  'arao.kumamoto.jp',
  'aso.kumamoto.jp',
  'choyo.kumamoto.jp',
  'gyokuto.kumamoto.jp',
  'kamiamakusa.kumamoto.jp',
  'kikuchi.kumamoto.jp',
  'kumamoto.kumamoto.jp',
  'mashiki.kumamoto.jp',
  'mifune.kumamoto.jp',
  'minamata.kumamoto.jp',
  'minamioguni.kumamoto.jp',
  'nagasu.kumamoto.jp',
  'nishihara.kumamoto.jp',
  'oguni.kumamoto.jp',
  'ozu.kumamoto.jp',
  'sumoto.kumamoto.jp',
  'takamori.kumamoto.jp',
  'uki.kumamoto.jp',
  'uto.kumamoto.jp',
  'yamaga.kumamoto.jp',
  'yamato.kumamoto.jp',
  'yatsushiro.kumamoto.jp',
  'ayabe.kyoto.jp',
  'fukuchiyama.kyoto.jp',
  'higashiyama.kyoto.jp',
  'ide.kyoto.jp',
  'ine.kyoto.jp',
  'joyo.kyoto.jp',
  'kameoka.kyoto.jp',
  'kamo.kyoto.jp',
  'kita.kyoto.jp',
  'kizu.kyoto.jp',
  'kumiyama.kyoto.jp',
  'kyotamba.kyoto.jp',
  'kyotanabe.kyoto.jp',
  'kyotango.kyoto.jp',
  'maizuru.kyoto.jp',
  'minami.kyoto.jp',
  'minamiyamashiro.kyoto.jp',
  'miyazu.kyoto.jp',
  'muko.kyoto.jp',
  'nagaokakyo.kyoto.jp',
  'nakagyo.kyoto.jp',
  'nantan.kyoto.jp',
  'oyamazaki.kyoto.jp',
  'sakyo.kyoto.jp',
  'seika.kyoto.jp',
  'tanabe.kyoto.jp',
  'uji.kyoto.jp',
  'ujitawara.kyoto.jp',
  'wazuka.kyoto.jp',
  'yamashina.kyoto.jp',
  'yawata.kyoto.jp',
  'asahi.mie.jp',
  'inabe.mie.jp',
  'ise.mie.jp',
  'kameyama.mie.jp',
  'kawagoe.mie.jp',
  'kiho.mie.jp',
  'kisosaki.mie.jp',
  'kiwa.mie.jp',
  'komono.mie.jp',
  'kumano.mie.jp',
  'kuwana.mie.jp',
  'matsusaka.mie.jp',
  'meiwa.mie.jp',
  'mihama.mie.jp',
  'minamiise.mie.jp',
  'misugi.mie.jp',
  'miyama.mie.jp',
  'nabari.mie.jp',
  'shima.mie.jp',
  'suzuka.mie.jp',
  'tado.mie.jp',
  'taiki.mie.jp',
  'taki.mie.jp',
  'tamaki.mie.jp',
  'toba.mie.jp',
  'tsu.mie.jp',
  'udono.mie.jp',
  'ureshino.mie.jp',
  'watarai.mie.jp',
  'yokkaichi.mie.jp',
  'furukawa.miyagi.jp',
  'higashimatsushima.miyagi.jp',
  'ishinomaki.miyagi.jp',
  'iwanuma.miyagi.jp',
  'kakuda.miyagi.jp',
  'kami.miyagi.jp',
  'kawasaki.miyagi.jp',
  'marumori.miyagi.jp',
  'matsushima.miyagi.jp',
  'minamisanriku.miyagi.jp',
  'misato.miyagi.jp',
  'murata.miyagi.jp',
  'natori.miyagi.jp',
  'ogawara.miyagi.jp',
  'ohira.miyagi.jp',
  'onagawa.miyagi.jp',
  'osaki.miyagi.jp',
  'rifu.miyagi.jp',
  'semine.miyagi.jp',
  'shibata.miyagi.jp',
  'shichikashuku.miyagi.jp',
  'shikama.miyagi.jp',
  'shiogama.miyagi.jp',
  'shiroishi.miyagi.jp',
  'tagajo.miyagi.jp',
  'taiwa.miyagi.jp',
  'tome.miyagi.jp',
  'tomiya.miyagi.jp',
  'wakuya.miyagi.jp',
  'watari.miyagi.jp',
  'yamamoto.miyagi.jp',
  'zao.miyagi.jp',
  'aya.miyazaki.jp',
  'ebino.miyazaki.jp',
  'gokase.miyazaki.jp',
  'hyuga.miyazaki.jp',
  'kadogawa.miyazaki.jp',
  'kawaminami.miyazaki.jp',
  'kijo.miyazaki.jp',
  'kitagawa.miyazaki.jp',
  'kitakata.miyazaki.jp',
  'kitaura.miyazaki.jp',
  'kobayashi.miyazaki.jp',
  'kunitomi.miyazaki.jp',
  'kushima.miyazaki.jp',
  'mimata.miyazaki.jp',
  'miyakonojo.miyazaki.jp',
  'miyazaki.miyazaki.jp',
  'morotsuka.miyazaki.jp',
  'nichinan.miyazaki.jp',
  'nishimera.miyazaki.jp',
  'nobeoka.miyazaki.jp',
  'saito.miyazaki.jp',
  'shiiba.miyazaki.jp',
  'shintomi.miyazaki.jp',
  'takaharu.miyazaki.jp',
  'takanabe.miyazaki.jp',
  'takazaki.miyazaki.jp',
  'tsuno.miyazaki.jp',
  'achi.nagano.jp',
  'agematsu.nagano.jp',
  'anan.nagano.jp',
  'aoki.nagano.jp',
  'asahi.nagano.jp',
  'azumino.nagano.jp',
  'chikuhoku.nagano.jp',
  'chikuma.nagano.jp',
  'chino.nagano.jp',
  'fujimi.nagano.jp',
  'hakuba.nagano.jp',
  'hara.nagano.jp',
  'hiraya.nagano.jp',
  'iida.nagano.jp',
  'iijima.nagano.jp',
  'iiyama.nagano.jp',
  'iizuna.nagano.jp',
  'ikeda.nagano.jp',
  'ikusaka.nagano.jp',
  'ina.nagano.jp',
  'karuizawa.nagano.jp',
  'kawakami.nagano.jp',
  'kiso.nagano.jp',
  'kisofukushima.nagano.jp',
  'kitaaiki.nagano.jp',
  'komagane.nagano.jp',
  'komoro.nagano.jp',
  'matsukawa.nagano.jp',
  'matsumoto.nagano.jp',
  'miasa.nagano.jp',
  'minamiaiki.nagano.jp',
  'minamimaki.nagano.jp',
  'minamiminowa.nagano.jp',
  'minowa.nagano.jp',
  'miyada.nagano.jp',
  'miyota.nagano.jp',
  'mochizuki.nagano.jp',
  'nagano.nagano.jp',
  'nagawa.nagano.jp',
  'nagiso.nagano.jp',
  'nakagawa.nagano.jp',
  'nakano.nagano.jp',
  'nozawaonsen.nagano.jp',
  'obuse.nagano.jp',
  'ogawa.nagano.jp',
  'okaya.nagano.jp',
  'omachi.nagano.jp',
  'omi.nagano.jp',
  'ookuwa.nagano.jp',
  'ooshika.nagano.jp',
  'otaki.nagano.jp',
  'otari.nagano.jp',
  'sakae.nagano.jp',
  'sakaki.nagano.jp',
  'saku.nagano.jp',
  'sakuho.nagano.jp',
  'shimosuwa.nagano.jp',
  'shinanomachi.nagano.jp',
  'shiojiri.nagano.jp',
  'suwa.nagano.jp',
  'suzaka.nagano.jp',
  'takagi.nagano.jp',
  'takamori.nagano.jp',
  'takayama.nagano.jp',
  'tateshina.nagano.jp',
  'tatsuno.nagano.jp',
  'togakushi.nagano.jp',
  'togura.nagano.jp',
  'tomi.nagano.jp',
  'ueda.nagano.jp',
  'wada.nagano.jp',
  'yamagata.nagano.jp',
  'yamanouchi.nagano.jp',
  'yasaka.nagano.jp',
  'yasuoka.nagano.jp',
  'chijiwa.nagasaki.jp',
  'futsu.nagasaki.jp',
  'goto.nagasaki.jp',
  'hasami.nagasaki.jp',
  'hirado.nagasaki.jp',
  'iki.nagasaki.jp',
  'isahaya.nagasaki.jp',
  'kawatana.nagasaki.jp',
  'kuchinotsu.nagasaki.jp',
  'matsuura.nagasaki.jp',
  'nagasaki.nagasaki.jp',
  'obama.nagasaki.jp',
  'omura.nagasaki.jp',
  'oseto.nagasaki.jp',
  'saikai.nagasaki.jp',
  'sasebo.nagasaki.jp',
  'seihi.nagasaki.jp',
  'shimabara.nagasaki.jp',
  'shinkamigoto.nagasaki.jp',
  'togitsu.nagasaki.jp',
  'tsushima.nagasaki.jp',
  'unzen.nagasaki.jp',
  'ando.nara.jp',
  'gose.nara.jp',
  'heguri.nara.jp',
  'higashiyoshino.nara.jp',
  'ikaruga.nara.jp',
  'ikoma.nara.jp',
  'kamikitayama.nara.jp',
  'kanmaki.nara.jp',
  'kashiba.nara.jp',
  'kashihara.nara.jp',
  'katsuragi.nara.jp',
  'kawai.nara.jp',
  'kawakami.nara.jp',
  'kawanishi.nara.jp',
  'koryo.nara.jp',
  'kurotaki.nara.jp',
  'mitsue.nara.jp',
  'miyake.nara.jp',
  'nara.nara.jp',
  'nosegawa.nara.jp',
  'oji.nara.jp',
  'ouda.nara.jp',
  'oyodo.nara.jp',
  'sakurai.nara.jp',
  'sango.nara.jp',
  'shimoichi.nara.jp',
  'shimokitayama.nara.jp',
  'shinjo.nara.jp',
  'soni.nara.jp',
  'takatori.nara.jp',
  'tawaramoto.nara.jp',
  'tenkawa.nara.jp',
  'tenri.nara.jp',
  'uda.nara.jp',
  'yamatokoriyama.nara.jp',
  'yamatotakada.nara.jp',
  'yamazoe.nara.jp',
  'yoshino.nara.jp',
  'aga.niigata.jp',
  'agano.niigata.jp',
  'gosen.niigata.jp',
  'itoigawa.niigata.jp',
  'izumozaki.niigata.jp',
  'joetsu.niigata.jp',
  'kamo.niigata.jp',
  'kariwa.niigata.jp',
  'kashiwazaki.niigata.jp',
  'minamiuonuma.niigata.jp',
  'mitsuke.niigata.jp',
  'muika.niigata.jp',
  'murakami.niigata.jp',
  'myoko.niigata.jp',
  'nagaoka.niigata.jp',
  'niigata.niigata.jp',
  'ojiya.niigata.jp',
  'omi.niigata.jp',
  'sado.niigata.jp',
  'sanjo.niigata.jp',
  'seiro.niigata.jp',
  'seirou.niigata.jp',
  'sekikawa.niigata.jp',
  'shibata.niigata.jp',
  'tagami.niigata.jp',
  'tainai.niigata.jp',
  'tochio.niigata.jp',
  'tokamachi.niigata.jp',
  'tsubame.niigata.jp',
  'tsunan.niigata.jp',
  'uonuma.niigata.jp',
  'yahiko.niigata.jp',
  'yoita.niigata.jp',
  'yuzawa.niigata.jp',
  'beppu.oita.jp',
  'bungoono.oita.jp',
  'bungotakada.oita.jp',
  'hasama.oita.jp',
  'hiji.oita.jp',
  'himeshima.oita.jp',
  'hita.oita.jp',
  'kamitsue.oita.jp',
  'kokonoe.oita.jp',
  'kuju.oita.jp',
  'kunisaki.oita.jp',
  'kusu.oita.jp',
  'oita.oita.jp',
  'saiki.oita.jp',
  'taketa.oita.jp',
  'tsukumi.oita.jp',
  'usa.oita.jp',
  'usuki.oita.jp',
  'yufu.oita.jp',
  'akaiwa.okayama.jp',
  'asakuchi.okayama.jp',
  'bizen.okayama.jp',
  'hayashima.okayama.jp',
  'ibara.okayama.jp',
  'kagamino.okayama.jp',
  'kasaoka.okayama.jp',
  'kibichuo.okayama.jp',
  'kumenan.okayama.jp',
  'kurashiki.okayama.jp',
  'maniwa.okayama.jp',
  'misaki.okayama.jp',
  'nagi.okayama.jp',
  'niimi.okayama.jp',
  'nishiawakura.okayama.jp',
  'okayama.okayama.jp',
  'satosho.okayama.jp',
  'setouchi.okayama.jp',
  'shinjo.okayama.jp',
  'shoo.okayama.jp',
  'soja.okayama.jp',
  'takahashi.okayama.jp',
  'tamano.okayama.jp',
  'tsuyama.okayama.jp',
  'wake.okayama.jp',
  'yakage.okayama.jp',
  'aguni.okinawa.jp',
  'ginowan.okinawa.jp',
  'ginoza.okinawa.jp',
  'gushikami.okinawa.jp',
  'haebaru.okinawa.jp',
  'higashi.okinawa.jp',
  'hirara.okinawa.jp',
  'iheya.okinawa.jp',
  'ishigaki.okinawa.jp',
  'ishikawa.okinawa.jp',
  'itoman.okinawa.jp',
  'izena.okinawa.jp',
  'kadena.okinawa.jp',
  'kin.okinawa.jp',
  'kitadaito.okinawa.jp',
  'kitanakagusuku.okinawa.jp',
  'kumejima.okinawa.jp',
  'kunigami.okinawa.jp',
  'minamidaito.okinawa.jp',
  'motobu.okinawa.jp',
  'nago.okinawa.jp',
  'naha.okinawa.jp',
  'nakagusuku.okinawa.jp',
  'nakijin.okinawa.jp',
  'nanjo.okinawa.jp',
  'nishihara.okinawa.jp',
  'ogimi.okinawa.jp',
  'okinawa.okinawa.jp',
  'onna.okinawa.jp',
  'shimoji.okinawa.jp',
  'taketomi.okinawa.jp',
  'tarama.okinawa.jp',
  'tokashiki.okinawa.jp',
  'tomigusuku.okinawa.jp',
  'tonaki.okinawa.jp',
  'urasoe.okinawa.jp',
  'uruma.okinawa.jp',
  'yaese.okinawa.jp',
  'yomitan.okinawa.jp',
  'yonabaru.okinawa.jp',
  'yonaguni.okinawa.jp',
  'zamami.okinawa.jp',
  'abeno.osaka.jp',
  'chihayaakasaka.osaka.jp',
  'chuo.osaka.jp',
  'daito.osaka.jp',
  'fujiidera.osaka.jp',
  'habikino.osaka.jp',
  'hannan.osaka.jp',
  'higashiosaka.osaka.jp',
  'higashisumiyoshi.osaka.jp',
  'higashiyodogawa.osaka.jp',
  'hirakata.osaka.jp',
  'ibaraki.osaka.jp',
  'ikeda.osaka.jp',
  'izumi.osaka.jp',
  'izumiotsu.osaka.jp',
  'izumisano.osaka.jp',
  'kadoma.osaka.jp',
  'kaizuka.osaka.jp',
  'kanan.osaka.jp',
  'kashiwara.osaka.jp',
  'katano.osaka.jp',
  'kawachinagano.osaka.jp',
  'kishiwada.osaka.jp',
  'kita.osaka.jp',
  'kumatori.osaka.jp',
  'matsubara.osaka.jp',
  'minato.osaka.jp',
  'minoh.osaka.jp',
  'misaki.osaka.jp',
  'moriguchi.osaka.jp',
  'neyagawa.osaka.jp',
  'nishi.osaka.jp',
  'nose.osaka.jp',
  'osakasayama.osaka.jp',
  'sakai.osaka.jp',
  'sayama.osaka.jp',
  'sennan.osaka.jp',
  'settsu.osaka.jp',
  'shijonawate.osaka.jp',
  'shimamoto.osaka.jp',
  'suita.osaka.jp',
  'tadaoka.osaka.jp',
  'taishi.osaka.jp',
  'tajiri.osaka.jp',
  'takaishi.osaka.jp',
  'takatsuki.osaka.jp',
  'tondabayashi.osaka.jp',
  'toyonaka.osaka.jp',
  'toyono.osaka.jp',
  'yao.osaka.jp',
  'ariake.saga.jp',
  'arita.saga.jp',
  'fukudomi.saga.jp',
  'genkai.saga.jp',
  'hamatama.saga.jp',
  'hizen.saga.jp',
  'imari.saga.jp',
  'kamimine.saga.jp',
  'kanzaki.saga.jp',
  'karatsu.saga.jp',
  'kashima.saga.jp',
  'kitagata.saga.jp',
  'kitahata.saga.jp',
  'kiyama.saga.jp',
  'kouhoku.saga.jp',
  'kyuragi.saga.jp',
  'nishiarita.saga.jp',
  'ogi.saga.jp',
  'omachi.saga.jp',
  'ouchi.saga.jp',
  'saga.saga.jp',
  'shiroishi.saga.jp',
  'taku.saga.jp',
  'tara.saga.jp',
  'tosu.saga.jp',
  'yoshinogari.saga.jp',
  'arakawa.saitama.jp',
  'asaka.saitama.jp',
  'chichibu.saitama.jp',
  'fujimi.saitama.jp',
  'fujimino.saitama.jp',
  'fukaya.saitama.jp',
  'hanno.saitama.jp',
  'hanyu.saitama.jp',
  'hasuda.saitama.jp',
  'hatogaya.saitama.jp',
  'hatoyama.saitama.jp',
  'hidaka.saitama.jp',
  'higashichichibu.saitama.jp',
  'higashimatsuyama.saitama.jp',
  'honjo.saitama.jp',
  'ina.saitama.jp',
  'iruma.saitama.jp',
  'iwatsuki.saitama.jp',
  'kamiizumi.saitama.jp',
  'kamikawa.saitama.jp',
  'kamisato.saitama.jp',
  'kasukabe.saitama.jp',
  'kawagoe.saitama.jp',
  'kawaguchi.saitama.jp',
  'kawajima.saitama.jp',
  'kazo.saitama.jp',
  'kitamoto.saitama.jp',
  'koshigaya.saitama.jp',
  'kounosu.saitama.jp',
  'kuki.saitama.jp',
  'kumagaya.saitama.jp',
  'matsubushi.saitama.jp',
  'minano.saitama.jp',
  'misato.saitama.jp',
  'miyashiro.saitama.jp',
  'miyoshi.saitama.jp',
  'moroyama.saitama.jp',
  'nagatoro.saitama.jp',
  'namegawa.saitama.jp',
  'niiza.saitama.jp',
  'ogano.saitama.jp',
  'ogawa.saitama.jp',
  'ogose.saitama.jp',
  'okegawa.saitama.jp',
  'omiya.saitama.jp',
  'otaki.saitama.jp',
  'ranzan.saitama.jp',
  'ryokami.saitama.jp',
  'saitama.saitama.jp',
  'sakado.saitama.jp',
  'satte.saitama.jp',
  'sayama.saitama.jp',
  'shiki.saitama.jp',
  'shiraoka.saitama.jp',
  'soka.saitama.jp',
  'sugito.saitama.jp',
  'toda.saitama.jp',
  'tokigawa.saitama.jp',
  'tokorozawa.saitama.jp',
  'tsurugashima.saitama.jp',
  'urawa.saitama.jp',
  'warabi.saitama.jp',
  'yashio.saitama.jp',
  'yokoze.saitama.jp',
  'yono.saitama.jp',
  'yorii.saitama.jp',
  'yoshida.saitama.jp',
  'yoshikawa.saitama.jp',
  'yoshimi.saitama.jp',
  'aisho.shiga.jp',
  'gamo.shiga.jp',
  'higashiomi.shiga.jp',
  'hikone.shiga.jp',
  'koka.shiga.jp',
  'konan.shiga.jp',
  'kosei.shiga.jp',
  'koto.shiga.jp',
  'kusatsu.shiga.jp',
  'maibara.shiga.jp',
  'moriyama.shiga.jp',
  'nagahama.shiga.jp',
  'nishiazai.shiga.jp',
  'notogawa.shiga.jp',
  'omihachiman.shiga.jp',
  'otsu.shiga.jp',
  'ritto.shiga.jp',
  'ryuoh.shiga.jp',
  'takashima.shiga.jp',
  'takatsuki.shiga.jp',
  'torahime.shiga.jp',
  'toyosato.shiga.jp',
  'yasu.shiga.jp',
  'akagi.shimane.jp',
  'ama.shimane.jp',
  'gotsu.shimane.jp',
  'hamada.shimane.jp',
  'higashiizumo.shimane.jp',
  'hikawa.shimane.jp',
  'hikimi.shimane.jp',
  'izumo.shimane.jp',
  'kakinoki.shimane.jp',
  'masuda.shimane.jp',
  'matsue.shimane.jp',
  'misato.shimane.jp',
  'nishinoshima.shimane.jp',
  'ohda.shimane.jp',
  'okinoshima.shimane.jp',
  'okuizumo.shimane.jp',
  'shimane.shimane.jp',
  'tamayu.shimane.jp',
  'tsuwano.shimane.jp',
  'unnan.shimane.jp',
  'yakumo.shimane.jp',
  'yasugi.shimane.jp',
  'yatsuka.shimane.jp',
  'arai.shizuoka.jp',
  'atami.shizuoka.jp',
  'fuji.shizuoka.jp',
  'fujieda.shizuoka.jp',
  'fujikawa.shizuoka.jp',
  'fujinomiya.shizuoka.jp',
  'fukuroi.shizuoka.jp',
  'gotemba.shizuoka.jp',
  'haibara.shizuoka.jp',
  'hamamatsu.shizuoka.jp',
  'higashiizu.shizuoka.jp',
  'ito.shizuoka.jp',
  'iwata.shizuoka.jp',
  'izu.shizuoka.jp',
  'izunokuni.shizuoka.jp',
  'kakegawa.shizuoka.jp',
  'kannami.shizuoka.jp',
  'kawanehon.shizuoka.jp',
  'kawazu.shizuoka.jp',
  'kikugawa.shizuoka.jp',
  'kosai.shizuoka.jp',
  'makinohara.shizuoka.jp',
  'matsuzaki.shizuoka.jp',
  'minamiizu.shizuoka.jp',
  'mishima.shizuoka.jp',
  'morimachi.shizuoka.jp',
  'nishiizu.shizuoka.jp',
  'numazu.shizuoka.jp',
  'omaezaki.shizuoka.jp',
  'shimada.shizuoka.jp',
  'shimizu.shizuoka.jp',
  'shimoda.shizuoka.jp',
  'shizuoka.shizuoka.jp',
  'susono.shizuoka.jp',
  'yaizu.shizuoka.jp',
  'yoshida.shizuoka.jp',
  'ashikaga.tochigi.jp',
  'bato.tochigi.jp',
  'haga.tochigi.jp',
  'ichikai.tochigi.jp',
  'iwafune.tochigi.jp',
  'kaminokawa.tochigi.jp',
  'kanuma.tochigi.jp',
  'karasuyama.tochigi.jp',
  'kuroiso.tochigi.jp',
  'mashiko.tochigi.jp',
  'mibu.tochigi.jp',
  'moka.tochigi.jp',
  'motegi.tochigi.jp',
  'nasu.tochigi.jp',
  'nasushiobara.tochigi.jp',
  'nikko.tochigi.jp',
  'nishikata.tochigi.jp',
  'nogi.tochigi.jp',
  'ohira.tochigi.jp',
  'ohtawara.tochigi.jp',
  'oyama.tochigi.jp',
  'sakura.tochigi.jp',
  'sano.tochigi.jp',
  'shimotsuke.tochigi.jp',
  'shioya.tochigi.jp',
  'takanezawa.tochigi.jp',
  'tochigi.tochigi.jp',
  'tsuga.tochigi.jp',
  'ujiie.tochigi.jp',
  'utsunomiya.tochigi.jp',
  'yaita.tochigi.jp',
  'aizumi.tokushima.jp',
  'anan.tokushima.jp',
  'ichiba.tokushima.jp',
  'itano.tokushima.jp',
  'kainan.tokushima.jp',
  'komatsushima.tokushima.jp',
  'matsushige.tokushima.jp',
  'mima.tokushima.jp',
  'minami.tokushima.jp',
  'miyoshi.tokushima.jp',
  'mugi.tokushima.jp',
  'nakagawa.tokushima.jp',
  'naruto.tokushima.jp',
  'sanagochi.tokushima.jp',
  'shishikui.tokushima.jp',
  'tokushima.tokushima.jp',
  'wajiki.tokushima.jp',
  'adachi.tokyo.jp',
  'akiruno.tokyo.jp',
  'akishima.tokyo.jp',
  'aogashima.tokyo.jp',
  'arakawa.tokyo.jp',
  'bunkyo.tokyo.jp',
  'chiyoda.tokyo.jp',
  'chofu.tokyo.jp',
  'chuo.tokyo.jp',
  'edogawa.tokyo.jp',
  'fuchu.tokyo.jp',
  'fussa.tokyo.jp',
  'hachijo.tokyo.jp',
  'hachioji.tokyo.jp',
  'hamura.tokyo.jp',
  'higashikurume.tokyo.jp',
  'higashimurayama.tokyo.jp',
  'higashiyamato.tokyo.jp',
  'hino.tokyo.jp',
  'hinode.tokyo.jp',
  'hinohara.tokyo.jp',
  'inagi.tokyo.jp',
  'itabashi.tokyo.jp',
  'katsushika.tokyo.jp',
  'kita.tokyo.jp',
  'kiyose.tokyo.jp',
  'kodaira.tokyo.jp',
  'koganei.tokyo.jp',
  'kokubunji.tokyo.jp',
  'komae.tokyo.jp',
  'koto.tokyo.jp',
  'kouzushima.tokyo.jp',
  'kunitachi.tokyo.jp',
  'machida.tokyo.jp',
  'meguro.tokyo.jp',
  'minato.tokyo.jp',
  'mitaka.tokyo.jp',
  'mizuho.tokyo.jp',
  'musashimurayama.tokyo.jp',
  'musashino.tokyo.jp',
  'nakano.tokyo.jp',
  'nerima.tokyo.jp',
  'ogasawara.tokyo.jp',
  'okutama.tokyo.jp',
  'ome.tokyo.jp',
  'oshima.tokyo.jp',
  'ota.tokyo.jp',
  'setagaya.tokyo.jp',
  'shibuya.tokyo.jp',
  'shinagawa.tokyo.jp',
  'shinjuku.tokyo.jp',
  'suginami.tokyo.jp',
  'sumida.tokyo.jp',
  'tachikawa.tokyo.jp',
  'taito.tokyo.jp',
  'tama.tokyo.jp',
  'toshima.tokyo.jp',
  'chizu.tottori.jp',
  'hino.tottori.jp',
  'kawahara.tottori.jp',
  'koge.tottori.jp',
  'kotoura.tottori.jp',
  'misasa.tottori.jp',
  'nanbu.tottori.jp',
  'nichinan.tottori.jp',
  'sakaiminato.tottori.jp',
  'tottori.tottori.jp',
  'wakasa.tottori.jp',
  'yazu.tottori.jp',
  'yonago.tottori.jp',
  'asahi.toyama.jp',
  'fuchu.toyama.jp',
  'fukumitsu.toyama.jp',
  'funahashi.toyama.jp',
  'himi.toyama.jp',
  'imizu.toyama.jp',
  'inami.toyama.jp',
  'johana.toyama.jp',
  'kamiichi.toyama.jp',
  'kurobe.toyama.jp',
  'nakaniikawa.toyama.jp',
  'namerikawa.toyama.jp',
  'nanto.toyama.jp',
  'nyuzen.toyama.jp',
  'oyabe.toyama.jp',
  'taira.toyama.jp',
  'takaoka.toyama.jp',
  'tateyama.toyama.jp',
  'toga.toyama.jp',
  'tonami.toyama.jp',
  'toyama.toyama.jp',
  'unazuki.toyama.jp',
  'uozu.toyama.jp',
  'yamada.toyama.jp',
  'arida.wakayama.jp',
  'aridagawa.wakayama.jp',
  'gobo.wakayama.jp',
  'hashimoto.wakayama.jp',
  'hidaka.wakayama.jp',
  'hirogawa.wakayama.jp',
  'inami.wakayama.jp',
  'iwade.wakayama.jp',
  'kainan.wakayama.jp',
  'kamitonda.wakayama.jp',
  'katsuragi.wakayama.jp',
  'kimino.wakayama.jp',
  'kinokawa.wakayama.jp',
  'kitayama.wakayama.jp',
  'koya.wakayama.jp',
  'koza.wakayama.jp',
  'kozagawa.wakayama.jp',
  'kudoyama.wakayama.jp',
  'kushimoto.wakayama.jp',
  'mihama.wakayama.jp',
  'misato.wakayama.jp',
  'nachikatsuura.wakayama.jp',
  'shingu.wakayama.jp',
  'shirahama.wakayama.jp',
  'taiji.wakayama.jp',
  'tanabe.wakayama.jp',
  'wakayama.wakayama.jp',
  'yuasa.wakayama.jp',
  'yura.wakayama.jp',
  'asahi.yamagata.jp',
  'funagata.yamagata.jp',
  'higashine.yamagata.jp',
  'iide.yamagata.jp',
  'kahoku.yamagata.jp',
  'kaminoyama.yamagata.jp',
  'kaneyama.yamagata.jp',
  'kawanishi.yamagata.jp',
  'mamurogawa.yamagata.jp',
  'mikawa.yamagata.jp',
  'murayama.yamagata.jp',
  'nagai.yamagata.jp',
  'nakayama.yamagata.jp',
  'nanyo.yamagata.jp',
  'nishikawa.yamagata.jp',
  'obanazawa.yamagata.jp',
  'oe.yamagata.jp',
  'oguni.yamagata.jp',
  'ohkura.yamagata.jp',
  'oishida.yamagata.jp',
  'sagae.yamagata.jp',
  'sakata.yamagata.jp',
  'sakegawa.yamagata.jp',
  'shinjo.yamagata.jp',
  'shirataka.yamagata.jp',
  'shonai.yamagata.jp',
  'takahata.yamagata.jp',
  'tendo.yamagata.jp',
  'tozawa.yamagata.jp',
  'tsuruoka.yamagata.jp',
  'yamagata.yamagata.jp',
  'yamanobe.yamagata.jp',
  'yonezawa.yamagata.jp',
  'yuza.yamagata.jp',
  'abu.yamaguchi.jp',
  'hagi.yamaguchi.jp',
  'hikari.yamaguchi.jp',
  'hofu.yamaguchi.jp',
  'iwakuni.yamaguchi.jp',
  'kudamatsu.yamaguchi.jp',
  'mitou.yamaguchi.jp',
  'nagato.yamaguchi.jp',
  'oshima.yamaguchi.jp',
  'shimonoseki.yamaguchi.jp',
  'shunan.yamaguchi.jp',
  'tabuse.yamaguchi.jp',
  'tokuyama.yamaguchi.jp',
  'toyota.yamaguchi.jp',
  'ube.yamaguchi.jp',
  'yuu.yamaguchi.jp',
  'chuo.yamanashi.jp',
  'doshi.yamanashi.jp',
  'fuefuki.yamanashi.jp',
  'fujikawa.yamanashi.jp',
  'fujikawaguchiko.yamanashi.jp',
  'fujiyoshida.yamanashi.jp',
  'hayakawa.yamanashi.jp',
  'hokuto.yamanashi.jp',
  'ichikawamisato.yamanashi.jp',
  'kai.yamanashi.jp',
  'kofu.yamanashi.jp',
  'koshu.yamanashi.jp',
  'kosuge.yamanashi.jp',
  'minami-alps.yamanashi.jp',
  'minobu.yamanashi.jp',
  'nakamichi.yamanashi.jp',
  'nanbu.yamanashi.jp',
  'narusawa.yamanashi.jp',
  'nirasaki.yamanashi.jp',
  'nishikatsura.yamanashi.jp',
  'oshino.yamanashi.jp',
  'otsuki.yamanashi.jp',
  'showa.yamanashi.jp',
  'tabayama.yamanashi.jp',
  'tsuru.yamanashi.jp',
  'uenohara.yamanashi.jp',
  'yamanakako.yamanashi.jp',
  'yamanashi.yamanashi.jp',
  'ke',
  'ac.ke',
  'co.ke',
  'go.ke',
  'info.ke',
  'me.ke',
  'mobi.ke',
  'ne.ke',
  'or.ke',
  'sc.ke',
  'kg',
  'org.kg',
  'net.kg',
  'com.kg',
  'edu.kg',
  'gov.kg',
  'mil.kg',
  '*.kh',
  'ki',
  'edu.ki',
  'biz.ki',
  'net.ki',
  'org.ki',
  'gov.ki',
  'info.ki',
  'com.ki',
  'km',
  'org.km',
  'nom.km',
  'gov.km',
  'prd.km',
  'tm.km',
  'edu.km',
  'mil.km',
  'ass.km',
  'com.km',
  'coop.km',
  'asso.km',
  'presse.km',
  'medecin.km',
  'notaires.km',
  'pharmaciens.km',
  'veterinaire.km',
  'gouv.km',
  'kn',
  'net.kn',
  'org.kn',
  'edu.kn',
  'gov.kn',
  'kp',
  'com.kp',
  'edu.kp',
  'gov.kp',
  'org.kp',
  'rep.kp',
  'tra.kp',
  'kr',
  'ac.kr',
  'co.kr',
  'es.kr',
  'go.kr',
  'hs.kr',
  'kg.kr',
  'mil.kr',
  'ms.kr',
  'ne.kr',
  'or.kr',
  'pe.kr',
  're.kr',
  'sc.kr',
  'busan.kr',
  'chungbuk.kr',
  'chungnam.kr',
  'daegu.kr',
  'daejeon.kr',
  'gangwon.kr',
  'gwangju.kr',
  'gyeongbuk.kr',
  'gyeonggi.kr',
  'gyeongnam.kr',
  'incheon.kr',
  'jeju.kr',
  'jeonbuk.kr',
  'jeonnam.kr',
  'seoul.kr',
  'ulsan.kr',
  'kw',
  'com.kw',
  'edu.kw',
  'emb.kw',
  'gov.kw',
  'ind.kw',
  'net.kw',
  'org.kw',
  'ky',
  'edu.ky',
  'gov.ky',
  'com.ky',
  'org.ky',
  'net.ky',
  'kz',
  'org.kz',
  'edu.kz',
  'net.kz',
  'gov.kz',
  'mil.kz',
  'com.kz',
  'la',
  'int.la',
  'net.la',
  'info.la',
  'edu.la',
  'gov.la',
  'per.la',
  'com.la',
  'org.la',
  'lb',
  'com.lb',
  'edu.lb',
  'gov.lb',
  'net.lb',
  'org.lb',
  'lc',
  'com.lc',
  'net.lc',
  'co.lc',
  'org.lc',
  'edu.lc',
  'gov.lc',
  'li',
  'lk',
  'gov.lk',
  'sch.lk',
  'net.lk',
  'int.lk',
  'com.lk',
  'org.lk',
  'edu.lk',
  'ngo.lk',
  'soc.lk',
  'web.lk',
  'ltd.lk',
  'assn.lk',
  'grp.lk',
  'hotel.lk',
  'ac.lk',
  'lr',
  'com.lr',
  'edu.lr',
  'gov.lr',
  'org.lr',
  'net.lr',
  'ls',
  'ac.ls',
  'biz.ls',
  'co.ls',
  'edu.ls',
  'gov.ls',
  'info.ls',
  'net.ls',
  'org.ls',
  'sc.ls',
  'lt',
  'gov.lt',
  'lu',
  'lv',
  'com.lv',
  'edu.lv',
  'gov.lv',
  'org.lv',
  'mil.lv',
  'id.lv',
  'net.lv',
  'asn.lv',
  'conf.lv',
  'ly',
  'com.ly',
  'net.ly',
  'gov.ly',
  'plc.ly',
  'edu.ly',
  'sch.ly',
  'med.ly',
  'org.ly',
  'id.ly',
  'ma',
  'co.ma',
  'net.ma',
  'gov.ma',
  'org.ma',
  'ac.ma',
  'press.ma',
  'mc',
  'tm.mc',
  'asso.mc',
  'md',
  'me',
  'co.me',
  'net.me',
  'org.me',
  'edu.me',
  'ac.me',
  'gov.me',
  'its.me',
  'priv.me',
  'mg',
  'org.mg',
  'nom.mg',
  'gov.mg',
  'prd.mg',
  'tm.mg',
  'edu.mg',
  'mil.mg',
  'com.mg',
  'co.mg',
  'mh',
  'mil',
  'mk',
  'com.mk',
  'org.mk',
  'net.mk',
  'edu.mk',
  'gov.mk',
  'inf.mk',
  'name.mk',
  'ml',
  'com.ml',
  'edu.ml',
  'gouv.ml',
  'gov.ml',
  'net.ml',
  'org.ml',
  'presse.ml',
  '*.mm',
  'mn',
  'gov.mn',
  'edu.mn',
  'org.mn',
  'mo',
  'com.mo',
  'net.mo',
  'org.mo',
  'edu.mo',
  'gov.mo',
  'mobi',
  'mp',
  'mq',
  'mr',
  'gov.mr',
  'ms',
  'com.ms',
  'edu.ms',
  'gov.ms',
  'net.ms',
  'org.ms',
  'mt',
  'com.mt',
  'edu.mt',
  'net.mt',
  'org.mt',
  'mu',
  'com.mu',
  'net.mu',
  'org.mu',
  'gov.mu',
  'ac.mu',
  'co.mu',
  'or.mu',
  'museum',
  'academy.museum',
  'agriculture.museum',
  'air.museum',
  'airguard.museum',
  'alabama.museum',
  'alaska.museum',
  'amber.museum',
  'ambulance.museum',
  'american.museum',
  'americana.museum',
  'americanantiques.museum',
  'americanart.museum',
  'amsterdam.museum',
  'and.museum',
  'annefrank.museum',
  'anthro.museum',
  'anthropology.museum',
  'antiques.museum',
  'aquarium.museum',
  'arboretum.museum',
  'archaeological.museum',
  'archaeology.museum',
  'architecture.museum',
  'art.museum',
  'artanddesign.museum',
  'artcenter.museum',
  'artdeco.museum',
  'arteducation.museum',
  'artgallery.museum',
  'arts.museum',
  'artsandcrafts.museum',
  'asmatart.museum',
  'assassination.museum',
  'assisi.museum',
  'association.museum',
  'astronomy.museum',
  'atlanta.museum',
  'austin.museum',
  'australia.museum',
  'automotive.museum',
  'aviation.museum',
  'axis.museum',
  'badajoz.museum',
  'baghdad.museum',
  'bahn.museum',
  'bale.museum',
  'baltimore.museum',
  'barcelona.museum',
  'baseball.museum',
  'basel.museum',
  'baths.museum',
  'bauern.museum',
  'beauxarts.museum',
  'beeldengeluid.museum',
  'bellevue.museum',
  'bergbau.museum',
  'berkeley.museum',
  'berlin.museum',
  'bern.museum',
  'bible.museum',
  'bilbao.museum',
  'bill.museum',
  'birdart.museum',
  'birthplace.museum',
  'bonn.museum',
  'boston.museum',
  'botanical.museum',
  'botanicalgarden.museum',
  'botanicgarden.museum',
  'botany.museum',
  'brandywinevalley.museum',
  'brasil.museum',
  'bristol.museum',
  'british.museum',
  'britishcolumbia.museum',
  'broadcast.museum',
  'brunel.museum',
  'brussel.museum',
  'brussels.museum',
  'bruxelles.museum',
  'building.museum',
  'burghof.museum',
  'bus.museum',
  'bushey.museum',
  'cadaques.museum',
  'california.museum',
  'cambridge.museum',
  'can.museum',
  'canada.museum',
  'capebreton.museum',
  'carrier.museum',
  'cartoonart.museum',
  'casadelamoneda.museum',
  'castle.museum',
  'castres.museum',
  'celtic.museum',
  'center.museum',
  'chattanooga.museum',
  'cheltenham.museum',
  'chesapeakebay.museum',
  'chicago.museum',
  'children.museum',
  'childrens.museum',
  'childrensgarden.museum',
  'chiropractic.museum',
  'chocolate.museum',
  'christiansburg.museum',
  'cincinnati.museum',
  'cinema.museum',
  'circus.museum',
  'civilisation.museum',
  'civilization.museum',
  'civilwar.museum',
  'clinton.museum',
  'clock.museum',
  'coal.museum',
  'coastaldefence.museum',
  'cody.museum',
  'coldwar.museum',
  'collection.museum',
  'colonialwilliamsburg.museum',
  'coloradoplateau.museum',
  'columbia.museum',
  'columbus.museum',
  'communication.museum',
  'communications.museum',
  'community.museum',
  'computer.museum',
  'computerhistory.museum',
  'comunicações.museum',
  'contemporary.museum',
  'contemporaryart.museum',
  'convent.museum',
  'copenhagen.museum',
  'corporation.museum',
  'correios-e-telecomunicações.museum',
  'corvette.museum',
  'costume.museum',
  'countryestate.museum',
  'county.museum',
  'crafts.museum',
  'cranbrook.museum',
  'creation.museum',
  'cultural.museum',
  'culturalcenter.museum',
  'culture.museum',
  'cyber.museum',
  'cymru.museum',
  'dali.museum',
  'dallas.museum',
  'database.museum',
  'ddr.museum',
  'decorativearts.museum',
  'delaware.museum',
  'delmenhorst.museum',
  'denmark.museum',
  'depot.museum',
  'design.museum',
  'detroit.museum',
  'dinosaur.museum',
  'discovery.museum',
  'dolls.museum',
  'donostia.museum',
  'durham.museum',
  'eastafrica.museum',
  'eastcoast.museum',
  'education.museum',
  'educational.museum',
  'egyptian.museum',
  'eisenbahn.museum',
  'elburg.museum',
  'elvendrell.museum',
  'embroidery.museum',
  'encyclopedic.museum',
  'england.museum',
  'entomology.museum',
  'environment.museum',
  'environmentalconservation.museum',
  'epilepsy.museum',
  'essex.museum',
  'estate.museum',
  'ethnology.museum',
  'exeter.museum',
  'exhibition.museum',
  'family.museum',
  'farm.museum',
  'farmequipment.museum',
  'farmers.museum',
  'farmstead.museum',
  'field.museum',
  'figueres.museum',
  'filatelia.museum',
  'film.museum',
  'fineart.museum',
  'finearts.museum',
  'finland.museum',
  'flanders.museum',
  'florida.museum',
  'force.museum',
  'fortmissoula.museum',
  'fortworth.museum',
  'foundation.museum',
  'francaise.museum',
  'frankfurt.museum',
  'franziskaner.museum',
  'freemasonry.museum',
  'freiburg.museum',
  'fribourg.museum',
  'frog.museum',
  'fundacio.museum',
  'furniture.museum',
  'gallery.museum',
  'garden.museum',
  'gateway.museum',
  'geelvinck.museum',
  'gemological.museum',
  'geology.museum',
  'georgia.museum',
  'giessen.museum',
  'glas.museum',
  'glass.museum',
  'gorge.museum',
  'grandrapids.museum',
  'graz.museum',
  'guernsey.museum',
  'halloffame.museum',
  'hamburg.museum',
  'handson.museum',
  'harvestcelebration.museum',
  'hawaii.museum',
  'health.museum',
  'heimatunduhren.museum',
  'hellas.museum',
  'helsinki.museum',
  'hembygdsforbund.museum',
  'heritage.museum',
  'histoire.museum',
  'historical.museum',
  'historicalsociety.museum',
  'historichouses.museum',
  'historisch.museum',
  'historisches.museum',
  'history.museum',
  'historyofscience.museum',
  'horology.museum',
  'house.museum',
  'humanities.museum',
  'illustration.museum',
  'imageandsound.museum',
  'indian.museum',
  'indiana.museum',
  'indianapolis.museum',
  'indianmarket.museum',
  'intelligence.museum',
  'interactive.museum',
  'iraq.museum',
  'iron.museum',
  'isleofman.museum',
  'jamison.museum',
  'jefferson.museum',
  'jerusalem.museum',
  'jewelry.museum',
  'jewish.museum',
  'jewishart.museum',
  'jfk.museum',
  'journalism.museum',
  'judaica.museum',
  'judygarland.museum',
  'juedisches.museum',
  'juif.museum',
  'karate.museum',
  'karikatur.museum',
  'kids.museum',
  'koebenhavn.museum',
  'koeln.museum',
  'kunst.museum',
  'kunstsammlung.museum',
  'kunstunddesign.museum',
  'labor.museum',
  'labour.museum',
  'lajolla.museum',
  'lancashire.museum',
  'landes.museum',
  'lans.museum',
  'läns.museum',
  'larsson.museum',
  'lewismiller.museum',
  'lincoln.museum',
  'linz.museum',
  'living.museum',
  'livinghistory.museum',
  'localhistory.museum',
  'london.museum',
  'losangeles.museum',
  'louvre.museum',
  'loyalist.museum',
  'lucerne.museum',
  'luxembourg.museum',
  'luzern.museum',
  'mad.museum',
  'madrid.museum',
  'mallorca.museum',
  'manchester.museum',
  'mansion.museum',
  'mansions.museum',
  'manx.museum',
  'marburg.museum',
  'maritime.museum',
  'maritimo.museum',
  'maryland.museum',
  'marylhurst.museum',
  'media.museum',
  'medical.museum',
  'medizinhistorisches.museum',
  'meeres.museum',
  'memorial.museum',
  'mesaverde.museum',
  'michigan.museum',
  'midatlantic.museum',
  'military.museum',
  'mill.museum',
  'miners.museum',
  'mining.museum',
  'minnesota.museum',
  'missile.museum',
  'missoula.museum',
  'modern.museum',
  'moma.museum',
  'money.museum',
  'monmouth.museum',
  'monticello.museum',
  'montreal.museum',
  'moscow.museum',
  'motorcycle.museum',
  'muenchen.museum',
  'muenster.museum',
  'mulhouse.museum',
  'muncie.museum',
  'museet.museum',
  'museumcenter.museum',
  'museumvereniging.museum',
  'music.museum',
  'national.museum',
  'nationalfirearms.museum',
  'nationalheritage.museum',
  'nativeamerican.museum',
  'naturalhistory.museum',
  'naturalhistorymuseum.museum',
  'naturalsciences.museum',
  'nature.museum',
  'naturhistorisches.museum',
  'natuurwetenschappen.museum',
  'naumburg.museum',
  'naval.museum',
  'nebraska.museum',
  'neues.museum',
  'newhampshire.museum',
  'newjersey.museum',
  'newmexico.museum',
  'newport.museum',
  'newspaper.museum',
  'newyork.museum',
  'niepce.museum',
  'norfolk.museum',
  'north.museum',
  'nrw.museum',
  'nyc.museum',
  'nyny.museum',
  'oceanographic.museum',
  'oceanographique.museum',
  'omaha.museum',
  'online.museum',
  'ontario.museum',
  'openair.museum',
  'oregon.museum',
  'oregontrail.museum',
  'otago.museum',
  'oxford.museum',
  'pacific.museum',
  'paderborn.museum',
  'palace.museum',
  'paleo.museum',
  'palmsprings.museum',
  'panama.museum',
  'paris.museum',
  'pasadena.museum',
  'pharmacy.museum',
  'philadelphia.museum',
  'philadelphiaarea.museum',
  'philately.museum',
  'phoenix.museum',
  'photography.museum',
  'pilots.museum',
  'pittsburgh.museum',
  'planetarium.museum',
  'plantation.museum',
  'plants.museum',
  'plaza.museum',
  'portal.museum',
  'portland.museum',
  'portlligat.museum',
  'posts-and-telecommunications.museum',
  'preservation.museum',
  'presidio.museum',
  'press.museum',
  'project.museum',
  'public.museum',
  'pubol.museum',
  'quebec.museum',
  'railroad.museum',
  'railway.museum',
  'research.museum',
  'resistance.museum',
  'riodejaneiro.museum',
  'rochester.museum',
  'rockart.museum',
  'roma.museum',
  'russia.museum',
  'saintlouis.museum',
  'salem.museum',
  'salvadordali.museum',
  'salzburg.museum',
  'sandiego.museum',
  'sanfrancisco.museum',
  'santabarbara.museum',
  'santacruz.museum',
  'santafe.museum',
  'saskatchewan.museum',
  'satx.museum',
  'savannahga.museum',
  'schlesisches.museum',
  'schoenbrunn.museum',
  'schokoladen.museum',
  'school.museum',
  'schweiz.museum',
  'science.museum',
  'scienceandhistory.museum',
  'scienceandindustry.museum',
  'sciencecenter.museum',
  'sciencecenters.museum',
  'science-fiction.museum',
  'sciencehistory.museum',
  'sciences.museum',
  'sciencesnaturelles.museum',
  'scotland.museum',
  'seaport.museum',
  'settlement.museum',
  'settlers.museum',
  'shell.museum',
  'sherbrooke.museum',
  'sibenik.museum',
  'silk.museum',
  'ski.museum',
  'skole.museum',
  'society.museum',
  'sologne.museum',
  'soundandvision.museum',
  'southcarolina.museum',
  'southwest.museum',
  'space.museum',
  'spy.museum',
  'square.museum',
  'stadt.museum',
  'stalbans.museum',
  'starnberg.museum',
  'state.museum',
  'stateofdelaware.museum',
  'station.museum',
  'steam.museum',
  'steiermark.museum',
  'stjohn.museum',
  'stockholm.museum',
  'stpetersburg.museum',
  'stuttgart.museum',
  'suisse.museum',
  'surgeonshall.museum',
  'surrey.museum',
  'svizzera.museum',
  'sweden.museum',
  'sydney.museum',
  'tank.museum',
  'tcm.museum',
  'technology.museum',
  'telekommunikation.museum',
  'television.museum',
  'texas.museum',
  'textile.museum',
  'theater.museum',
  'time.museum',
  'timekeeping.museum',
  'topology.museum',
  'torino.museum',
  'touch.museum',
  'town.museum',
  'transport.museum',
  'tree.museum',
  'trolley.museum',
  'trust.museum',
  'trustee.museum',
  'uhren.museum',
  'ulm.museum',
  'undersea.museum',
  'university.museum',
  'usa.museum',
  'usantiques.museum',
  'usarts.museum',
  'uscountryestate.museum',
  'usculture.museum',
  'usdecorativearts.museum',
  'usgarden.museum',
  'ushistory.museum',
  'ushuaia.museum',
  'uslivinghistory.museum',
  'utah.museum',
  'uvic.museum',
  'valley.museum',
  'vantaa.museum',
  'versailles.museum',
  'viking.museum',
  'village.museum',
  'virginia.museum',
  'virtual.museum',
  'virtuel.museum',
  'vlaanderen.museum',
  'volkenkunde.museum',
  'wales.museum',
  'wallonie.museum',
  'war.museum',
  'washingtondc.museum',
  'watchandclock.museum',
  'watch-and-clock.museum',
  'western.museum',
  'westfalen.museum',
  'whaling.museum',
  'wildlife.museum',
  'williamsburg.museum',
  'windmill.museum',
  'workshop.museum',
  'york.museum',
  'yorkshire.museum',
  'yosemite.museum',
  'youth.museum',
  'zoological.museum',
  'zoology.museum',
  'ירושלים.museum',
  'иком.museum',
  'mv',
  'aero.mv',
  'biz.mv',
  'com.mv',
  'coop.mv',
  'edu.mv',
  'gov.mv',
  'info.mv',
  'int.mv',
  'mil.mv',
  'museum.mv',
  'name.mv',
  'net.mv',
  'org.mv',
  'pro.mv',
  'mw',
  'ac.mw',
  'biz.mw',
  'co.mw',
  'com.mw',
  'coop.mw',
  'edu.mw',
  'gov.mw',
  'int.mw',
  'museum.mw',
  'net.mw',
  'org.mw',
  'mx',
  'com.mx',
  'org.mx',
  'gob.mx',
  'edu.mx',
  'net.mx',
  'my',
  'com.my',
  'net.my',
  'org.my',
  'gov.my',
  'edu.my',
  'mil.my',
  'name.my',
  'mz',
  'ac.mz',
  'adv.mz',
  'co.mz',
  'edu.mz',
  'gov.mz',
  'mil.mz',
  'net.mz',
  'org.mz',
  'na',
  'info.na',
  'pro.na',
  'name.na',
  'school.na',
  'or.na',
  'dr.na',
  'us.na',
  'mx.na',
  'ca.na',
  'in.na',
  'cc.na',
  'tv.na',
  'ws.na',
  'mobi.na',
  'co.na',
  'com.na',
  'org.na',
  'name',
  'nc',
  'asso.nc',
  'nom.nc',
  'ne',
  'net',
  'nf',
  'com.nf',
  'net.nf',
  'per.nf',
  'rec.nf',
  'web.nf',
  'arts.nf',
  'firm.nf',
  'info.nf',
  'other.nf',
  'store.nf',
  'ng',
  'com.ng',
  'edu.ng',
  'gov.ng',
  'i.ng',
  'mil.ng',
  'mobi.ng',
  'name.ng',
  'net.ng',
  'org.ng',
  'sch.ng',
  'ni',
  'ac.ni',
  'biz.ni',
  'co.ni',
  'com.ni',
  'edu.ni',
  'gob.ni',
  'in.ni',
  'info.ni',
  'int.ni',
  'mil.ni',
  'net.ni',
  'nom.ni',
  'org.ni',
  'web.ni',
  'nl',
  'no',
  'fhs.no',
  'vgs.no',
  'fylkesbibl.no',
  'folkebibl.no',
  'museum.no',
  'idrett.no',
  'priv.no',
  'mil.no',
  'stat.no',
  'dep.no',
  'kommune.no',
  'herad.no',
  'aa.no',
  'ah.no',
  'bu.no',
  'fm.no',
  'hl.no',
  'hm.no',
  'jan-mayen.no',
  'mr.no',
  'nl.no',
  'nt.no',
  'of.no',
  'ol.no',
  'oslo.no',
  'rl.no',
  'sf.no',
  'st.no',
  'svalbard.no',
  'tm.no',
  'tr.no',
  'va.no',
  'vf.no',
  'gs.aa.no',
  'gs.ah.no',
  'gs.bu.no',
  'gs.fm.no',
  'gs.hl.no',
  'gs.hm.no',
  'gs.jan-mayen.no',
  'gs.mr.no',
  'gs.nl.no',
  'gs.nt.no',
  'gs.of.no',
  'gs.ol.no',
  'gs.oslo.no',
  'gs.rl.no',
  'gs.sf.no',
  'gs.st.no',
  'gs.svalbard.no',
  'gs.tm.no',
  'gs.tr.no',
  'gs.va.no',
  'gs.vf.no',
  'akrehamn.no',
  'åkrehamn.no',
  'algard.no',
  'ålgård.no',
  'arna.no',
  'brumunddal.no',
  'bryne.no',
  'bronnoysund.no',
  'brønnøysund.no',
  'drobak.no',
  'drøbak.no',
  'egersund.no',
  'fetsund.no',
  'floro.no',
  'florø.no',
  'fredrikstad.no',
  'hokksund.no',
  'honefoss.no',
  'hønefoss.no',
  'jessheim.no',
  'jorpeland.no',
  'jørpeland.no',
  'kirkenes.no',
  'kopervik.no',
  'krokstadelva.no',
  'langevag.no',
  'langevåg.no',
  'leirvik.no',
  'mjondalen.no',
  'mjøndalen.no',
  'mo-i-rana.no',
  'mosjoen.no',
  'mosjøen.no',
  'nesoddtangen.no',
  'orkanger.no',
  'osoyro.no',
  'osøyro.no',
  'raholt.no',
  'råholt.no',
  'sandnessjoen.no',
  'sandnessjøen.no',
  'skedsmokorset.no',
  'slattum.no',
  'spjelkavik.no',
  'stathelle.no',
  'stavern.no',
  'stjordalshalsen.no',
  'stjørdalshalsen.no',
  'tananger.no',
  'tranby.no',
  'vossevangen.no',
  'afjord.no',
  'åfjord.no',
  'agdenes.no',
  'al.no',
  'ål.no',
  'alesund.no',
  'ålesund.no',
  'alstahaug.no',
  'alta.no',
  'áltá.no',
  'alaheadju.no',
  'álaheadju.no',
  'alvdal.no',
  'amli.no',
  'åmli.no',
  'amot.no',
  'åmot.no',
  'andebu.no',
  'andoy.no',
  'andøy.no',
  'andasuolo.no',
  'ardal.no',
  'årdal.no',
  'aremark.no',
  'arendal.no',
  'ås.no',
  'aseral.no',
  'åseral.no',
  'asker.no',
  'askim.no',
  'askvoll.no',
  'askoy.no',
  'askøy.no',
  'asnes.no',
  'åsnes.no',
  'audnedaln.no',
  'aukra.no',
  'aure.no',
  'aurland.no',
  'aurskog-holand.no',
  'aurskog-høland.no',
  'austevoll.no',
  'austrheim.no',
  'averoy.no',
  'averøy.no',
  'balestrand.no',
  'ballangen.no',
  'balat.no',
  'bálát.no',
  'balsfjord.no',
  'bahccavuotna.no',
  'báhccavuotna.no',
  'bamble.no',
  'bardu.no',
  'beardu.no',
  'beiarn.no',
  'bajddar.no',
  'bájddar.no',
  'baidar.no',
  'báidár.no',
  'berg.no',
  'bergen.no',
  'berlevag.no',
  'berlevåg.no',
  'bearalvahki.no',
  'bearalváhki.no',
  'bindal.no',
  'birkenes.no',
  'bjarkoy.no',
  'bjarkøy.no',
  'bjerkreim.no',
  'bjugn.no',
  'bodo.no',
  'bodø.no',
  'badaddja.no',
  'bådåddjå.no',
  'budejju.no',
  'bokn.no',
  'bremanger.no',
  'bronnoy.no',
  'brønnøy.no',
  'bygland.no',
  'bykle.no',
  'barum.no',
  'bærum.no',
  'bo.telemark.no',
  'bø.telemark.no',
  'bo.nordland.no',
  'bø.nordland.no',
  'bievat.no',
  'bievát.no',
  'bomlo.no',
  'bømlo.no',
  'batsfjord.no',
  'båtsfjord.no',
  'bahcavuotna.no',
  'báhcavuotna.no',
  'dovre.no',
  'drammen.no',
  'drangedal.no',
  'dyroy.no',
  'dyrøy.no',
  'donna.no',
  'dønna.no',
  'eid.no',
  'eidfjord.no',
  'eidsberg.no',
  'eidskog.no',
  'eidsvoll.no',
  'eigersund.no',
  'elverum.no',
  'enebakk.no',
  'engerdal.no',
  'etne.no',
  'etnedal.no',
  'evenes.no',
  'evenassi.no',
  'evenášši.no',
  'evje-og-hornnes.no',
  'farsund.no',
  'fauske.no',
  'fuossko.no',
  'fuoisku.no',
  'fedje.no',
  'fet.no',
  'finnoy.no',
  'finnøy.no',
  'fitjar.no',
  'fjaler.no',
  'fjell.no',
  'flakstad.no',
  'flatanger.no',
  'flekkefjord.no',
  'flesberg.no',
  'flora.no',
  'fla.no',
  'flå.no',
  'folldal.no',
  'forsand.no',
  'fosnes.no',
  'frei.no',
  'frogn.no',
  'froland.no',
  'frosta.no',
  'frana.no',
  'fræna.no',
  'froya.no',
  'frøya.no',
  'fusa.no',
  'fyresdal.no',
  'forde.no',
  'førde.no',
  'gamvik.no',
  'gangaviika.no',
  'gáŋgaviika.no',
  'gaular.no',
  'gausdal.no',
  'gildeskal.no',
  'gildeskål.no',
  'giske.no',
  'gjemnes.no',
  'gjerdrum.no',
  'gjerstad.no',
  'gjesdal.no',
  'gjovik.no',
  'gjøvik.no',
  'gloppen.no',
  'gol.no',
  'gran.no',
  'grane.no',
  'granvin.no',
  'gratangen.no',
  'grimstad.no',
  'grong.no',
  'kraanghke.no',
  'kråanghke.no',
  'grue.no',
  'gulen.no',
  'hadsel.no',
  'halden.no',
  'halsa.no',
  'hamar.no',
  'hamaroy.no',
  'habmer.no',
  'hábmer.no',
  'hapmir.no',
  'hápmir.no',
  'hammerfest.no',
  'hammarfeasta.no',
  'hámmárfeasta.no',
  'haram.no',
  'hareid.no',
  'harstad.no',
  'hasvik.no',
  'aknoluokta.no',
  'ákŋoluokta.no',
  'hattfjelldal.no',
  'aarborte.no',
  'haugesund.no',
  'hemne.no',
  'hemnes.no',
  'hemsedal.no',
  'heroy.more-og-romsdal.no',
  'herøy.møre-og-romsdal.no',
  'heroy.nordland.no',
  'herøy.nordland.no',
  'hitra.no',
  'hjartdal.no',
  'hjelmeland.no',
  'hobol.no',
  'hobøl.no',
  'hof.no',
  'hol.no',
  'hole.no',
  'holmestrand.no',
  'holtalen.no',
  'holtålen.no',
  'hornindal.no',
  'horten.no',
  'hurdal.no',
  'hurum.no',
  'hvaler.no',
  'hyllestad.no',
  'hagebostad.no',
  'hægebostad.no',
  'hoyanger.no',
  'høyanger.no',
  'hoylandet.no',
  'høylandet.no',
  'ha.no',
  'hå.no',
  'ibestad.no',
  'inderoy.no',
  'inderøy.no',
  'iveland.no',
  'jevnaker.no',
  'jondal.no',
  'jolster.no',
  'jølster.no',
  'karasjok.no',
  'karasjohka.no',
  'kárášjohka.no',
  'karlsoy.no',
  'galsa.no',
  'gálsá.no',
  'karmoy.no',
  'karmøy.no',
  'kautokeino.no',
  'guovdageaidnu.no',
  'klepp.no',
  'klabu.no',
  'klæbu.no',
  'kongsberg.no',
  'kongsvinger.no',
  'kragero.no',
  'kragerø.no',
  'kristiansand.no',
  'kristiansund.no',
  'krodsherad.no',
  'krødsherad.no',
  'kvalsund.no',
  'rahkkeravju.no',
  'ráhkkerávju.no',
  'kvam.no',
  'kvinesdal.no',
  'kvinnherad.no',
  'kviteseid.no',
  'kvitsoy.no',
  'kvitsøy.no',
  'kvafjord.no',
  'kvæfjord.no',
  'giehtavuoatna.no',
  'kvanangen.no',
  'kvænangen.no',
  'navuotna.no',
  'návuotna.no',
  'kafjord.no',
  'kåfjord.no',
  'gaivuotna.no',
  'gáivuotna.no',
  'larvik.no',
  'lavangen.no',
  'lavagis.no',
  'loabat.no',
  'loabát.no',
  'lebesby.no',
  'davvesiida.no',
  'leikanger.no',
  'leirfjord.no',
  'leka.no',
  'leksvik.no',
  'lenvik.no',
  'leangaviika.no',
  'leaŋgaviika.no',
  'lesja.no',
  'levanger.no',
  'lier.no',
  'lierne.no',
  'lillehammer.no',
  'lillesand.no',
  'lindesnes.no',
  'lindas.no',
  'lindås.no',
  'lom.no',
  'loppa.no',
  'lahppi.no',
  'láhppi.no',
  'lund.no',
  'lunner.no',
  'luroy.no',
  'lurøy.no',
  'luster.no',
  'lyngdal.no',
  'lyngen.no',
  'ivgu.no',
  'lardal.no',
  'lerdal.no',
  'lærdal.no',
  'lodingen.no',
  'lødingen.no',
  'lorenskog.no',
  'lørenskog.no',
  'loten.no',
  'løten.no',
  'malvik.no',
  'masoy.no',
  'måsøy.no',
  'muosat.no',
  'muosát.no',
  'mandal.no',
  'marker.no',
  'marnardal.no',
  'masfjorden.no',
  'meland.no',
  'meldal.no',
  'melhus.no',
  'meloy.no',
  'meløy.no',
  'meraker.no',
  'meråker.no',
  'moareke.no',
  'moåreke.no',
  'midsund.no',
  'midtre-gauldal.no',
  'modalen.no',
  'modum.no',
  'molde.no',
  'moskenes.no',
  'moss.no',
  'mosvik.no',
  'malselv.no',
  'målselv.no',
  'malatvuopmi.no',
  'málatvuopmi.no',
  'namdalseid.no',
  'aejrie.no',
  'namsos.no',
  'namsskogan.no',
  'naamesjevuemie.no',
  'nååmesjevuemie.no',
  'laakesvuemie.no',
  'nannestad.no',
  'narvik.no',
  'narviika.no',
  'naustdal.no',
  'nedre-eiker.no',
  'nes.akershus.no',
  'nes.buskerud.no',
  'nesna.no',
  'nesodden.no',
  'nesseby.no',
  'unjarga.no',
  'unjárga.no',
  'nesset.no',
  'nissedal.no',
  'nittedal.no',
  'nord-aurdal.no',
  'nord-fron.no',
  'nord-odal.no',
  'norddal.no',
  'nordkapp.no',
  'davvenjarga.no',
  'davvenjárga.no',
  'nordre-land.no',
  'nordreisa.no',
  'raisa.no',
  'ráisa.no',
  'nore-og-uvdal.no',
  'notodden.no',
  'naroy.no',
  'nærøy.no',
  'notteroy.no',
  'nøtterøy.no',
  'odda.no',
  'oksnes.no',
  'øksnes.no',
  'oppdal.no',
  'oppegard.no',
  'oppegård.no',
  'orkdal.no',
  'orland.no',
  'ørland.no',
  'orskog.no',
  'ørskog.no',
  'orsta.no',
  'ørsta.no',
  'os.hedmark.no',
  'os.hordaland.no',
  'osen.no',
  'osteroy.no',
  'osterøy.no',
  'ostre-toten.no',
  'østre-toten.no',
  'overhalla.no',
  'ovre-eiker.no',
  'øvre-eiker.no',
  'oyer.no',
  'øyer.no',
  'oygarden.no',
  'øygarden.no',
  'oystre-slidre.no',
  'øystre-slidre.no',
  'porsanger.no',
  'porsangu.no',
  'porsáŋgu.no',
  'porsgrunn.no',
  'radoy.no',
  'radøy.no',
  'rakkestad.no',
  'rana.no',
  'ruovat.no',
  'randaberg.no',
  'rauma.no',
  'rendalen.no',
  'rennebu.no',
  'rennesoy.no',
  'rennesøy.no',
  'rindal.no',
  'ringebu.no',
  'ringerike.no',
  'ringsaker.no',
  'rissa.no',
  'risor.no',
  'risør.no',
  'roan.no',
  'rollag.no',
  'rygge.no',
  'ralingen.no',
  'rælingen.no',
  'rodoy.no',
  'rødøy.no',
  'romskog.no',
  'rømskog.no',
  'roros.no',
  'røros.no',
  'rost.no',
  'røst.no',
  'royken.no',
  'røyken.no',
  'royrvik.no',
  'røyrvik.no',
  'rade.no',
  'råde.no',
  'salangen.no',
  'siellak.no',
  'saltdal.no',
  'salat.no',
  'sálát.no',
  'sálat.no',
  'samnanger.no',
  'sande.more-og-romsdal.no',
  'sande.møre-og-romsdal.no',
  'sande.vestfold.no',
  'sandefjord.no',
  'sandnes.no',
  'sandoy.no',
  'sandøy.no',
  'sarpsborg.no',
  'sauda.no',
  'sauherad.no',
  'sel.no',
  'selbu.no',
  'selje.no',
  'seljord.no',
  'sigdal.no',
  'siljan.no',
  'sirdal.no',
  'skaun.no',
  'skedsmo.no',
  'ski.no',
  'skien.no',
  'skiptvet.no',
  'skjervoy.no',
  'skjervøy.no',
  'skierva.no',
  'skiervá.no',
  'skjak.no',
  'skjåk.no',
  'skodje.no',
  'skanland.no',
  'skånland.no',
  'skanit.no',
  'skánit.no',
  'smola.no',
  'smøla.no',
  'snillfjord.no',
  'snasa.no',
  'snåsa.no',
  'snoasa.no',
  'snaase.no',
  'snåase.no',
  'sogndal.no',
  'sokndal.no',
  'sola.no',
  'solund.no',
  'songdalen.no',
  'sortland.no',
  'spydeberg.no',
  'stange.no',
  'stavanger.no',
  'steigen.no',
  'steinkjer.no',
  'stjordal.no',
  'stjørdal.no',
  'stokke.no',
  'stor-elvdal.no',
  'stord.no',
  'stordal.no',
  'storfjord.no',
  'omasvuotna.no',
  'strand.no',
  'stranda.no',
  'stryn.no',
  'sula.no',
  'suldal.no',
  'sund.no',
  'sunndal.no',
  'surnadal.no',
  'sveio.no',
  'svelvik.no',
  'sykkylven.no',
  'sogne.no',
  'søgne.no',
  'somna.no',
  'sømna.no',
  'sondre-land.no',
  'søndre-land.no',
  'sor-aurdal.no',
  'sør-aurdal.no',
  'sor-fron.no',
  'sør-fron.no',
  'sor-odal.no',
  'sør-odal.no',
  'sor-varanger.no',
  'sør-varanger.no',
  'matta-varjjat.no',
  'mátta-várjjat.no',
  'sorfold.no',
  'sørfold.no',
  'sorreisa.no',
  'sørreisa.no',
  'sorum.no',
  'sørum.no',
  'tana.no',
  'deatnu.no',
  'time.no',
  'tingvoll.no',
  'tinn.no',
  'tjeldsund.no',
  'dielddanuorri.no',
  'tjome.no',
  'tjøme.no',
  'tokke.no',
  'tolga.no',
  'torsken.no',
  'tranoy.no',
  'tranøy.no',
  'tromso.no',
  'tromsø.no',
  'tromsa.no',
  'romsa.no',
  'trondheim.no',
  'troandin.no',
  'trysil.no',
  'trana.no',
  'træna.no',
  'trogstad.no',
  'trøgstad.no',
  'tvedestrand.no',
  'tydal.no',
  'tynset.no',
  'tysfjord.no',
  'divtasvuodna.no',
  'divttasvuotna.no',
  'tysnes.no',
  'tysvar.no',
  'tysvær.no',
  'tonsberg.no',
  'tønsberg.no',
  'ullensaker.no',
  'ullensvang.no',
  'ulvik.no',
  'utsira.no',
  'vadso.no',
  'vadsø.no',
  'cahcesuolo.no',
  'čáhcesuolo.no',
  'vaksdal.no',
  'valle.no',
  'vang.no',
  'vanylven.no',
  'vardo.no',
  'vardø.no',
  'varggat.no',
  'várggát.no',
  'vefsn.no',
  'vaapste.no',
  'vega.no',
  'vegarshei.no',
  'vegårshei.no',
  'vennesla.no',
  'verdal.no',
  'verran.no',
  'vestby.no',
  'vestnes.no',
  'vestre-slidre.no',
  'vestre-toten.no',
  'vestvagoy.no',
  'vestvågøy.no',
  'vevelstad.no',
  'vik.no',
  'vikna.no',
  'vindafjord.no',
  'volda.no',
  'voss.no',
  'varoy.no',
  'værøy.no',
  'vagan.no',
  'vågan.no',
  'voagat.no',
  'vagsoy.no',
  'vågsøy.no',
  'vaga.no',
  'vågå.no',
  'valer.ostfold.no',
  'våler.østfold.no',
  'valer.hedmark.no',
  'våler.hedmark.no',
  '*.np',
  'nr',
  'biz.nr',
  'info.nr',
  'gov.nr',
  'edu.nr',
  'org.nr',
  'net.nr',
  'com.nr',
  'nu',
  'nz',
  'ac.nz',
  'co.nz',
  'cri.nz',
  'geek.nz',
  'gen.nz',
  'govt.nz',
  'health.nz',
  'iwi.nz',
  'kiwi.nz',
  'maori.nz',
  'mil.nz',
  'māori.nz',
  'net.nz',
  'org.nz',
  'parliament.nz',
  'school.nz',
  'om',
  'co.om',
  'com.om',
  'edu.om',
  'gov.om',
  'med.om',
  'museum.om',
  'net.om',
  'org.om',
  'pro.om',
  'onion',
  'org',
  'pa',
  'ac.pa',
  'gob.pa',
  'com.pa',
  'org.pa',
  'sld.pa',
  'edu.pa',
  'net.pa',
  'ing.pa',
  'abo.pa',
  'med.pa',
  'nom.pa',
  'pe',
  'edu.pe',
  'gob.pe',
  'nom.pe',
  'mil.pe',
  'org.pe',
  'com.pe',
  'net.pe',
  'pf',
  'com.pf',
  'org.pf',
  'edu.pf',
  '*.pg',
  'ph',
  'com.ph',
  'net.ph',
  'org.ph',
  'gov.ph',
  'edu.ph',
  'ngo.ph',
  'mil.ph',
  'i.ph',
  'pk',
  'com.pk',
  'net.pk',
  'edu.pk',
  'org.pk',
  'fam.pk',
  'biz.pk',
  'web.pk',
  'gov.pk',
  'gob.pk',
  'gok.pk',
  'gon.pk',
  'gop.pk',
  'gos.pk',
  'info.pk',
  'pl',
  'com.pl',
  'net.pl',
  'org.pl',
  'aid.pl',
  'agro.pl',
  'atm.pl',
  'auto.pl',
  'biz.pl',
  'edu.pl',
  'gmina.pl',
  'gsm.pl',
  'info.pl',
  'mail.pl',
  'miasta.pl',
  'media.pl',
  'mil.pl',
  'nieruchomosci.pl',
  'nom.pl',
  'pc.pl',
  'powiat.pl',
  'priv.pl',
  'realestate.pl',
  'rel.pl',
  'sex.pl',
  'shop.pl',
  'sklep.pl',
  'sos.pl',
  'szkola.pl',
  'targi.pl',
  'tm.pl',
  'tourism.pl',
  'travel.pl',
  'turystyka.pl',
  'gov.pl',
  'ap.gov.pl',
  'ic.gov.pl',
  'is.gov.pl',
  'us.gov.pl',
  'kmpsp.gov.pl',
  'kppsp.gov.pl',
  'kwpsp.gov.pl',
  'psp.gov.pl',
  'wskr.gov.pl',
  'kwp.gov.pl',
  'mw.gov.pl',
  'ug.gov.pl',
  'um.gov.pl',
  'umig.gov.pl',
  'ugim.gov.pl',
  'upow.gov.pl',
  'uw.gov.pl',
  'starostwo.gov.pl',
  'pa.gov.pl',
  'po.gov.pl',
  'psse.gov.pl',
  'pup.gov.pl',
  'rzgw.gov.pl',
  'sa.gov.pl',
  'so.gov.pl',
  'sr.gov.pl',
  'wsa.gov.pl',
  'sko.gov.pl',
  'uzs.gov.pl',
  'wiih.gov.pl',
  'winb.gov.pl',
  'pinb.gov.pl',
  'wios.gov.pl',
  'witd.gov.pl',
  'wzmiuw.gov.pl',
  'piw.gov.pl',
  'wiw.gov.pl',
  'griw.gov.pl',
  'wif.gov.pl',
  'oum.gov.pl',
  'sdn.gov.pl',
  'zp.gov.pl',
  'uppo.gov.pl',
  'mup.gov.pl',
  'wuoz.gov.pl',
  'konsulat.gov.pl',
  'oirm.gov.pl',
  'augustow.pl',
  'babia-gora.pl',
  'bedzin.pl',
  'beskidy.pl',
  'bialowieza.pl',
  'bialystok.pl',
  'bielawa.pl',
  'bieszczady.pl',
  'boleslawiec.pl',
  'bydgoszcz.pl',
  'bytom.pl',
  'cieszyn.pl',
  'czeladz.pl',
  'czest.pl',
  'dlugoleka.pl',
  'elblag.pl',
  'elk.pl',
  'glogow.pl',
  'gniezno.pl',
  'gorlice.pl',
  'grajewo.pl',
  'ilawa.pl',
  'jaworzno.pl',
  'jelenia-gora.pl',
  'jgora.pl',
  'kalisz.pl',
  'kazimierz-dolny.pl',
  'karpacz.pl',
  'kartuzy.pl',
  'kaszuby.pl',
  'katowice.pl',
  'kepno.pl',
  'ketrzyn.pl',
  'klodzko.pl',
  'kobierzyce.pl',
  'kolobrzeg.pl',
  'konin.pl',
  'konskowola.pl',
  'kutno.pl',
  'lapy.pl',
  'lebork.pl',
  'legnica.pl',
  'lezajsk.pl',
  'limanowa.pl',
  'lomza.pl',
  'lowicz.pl',
  'lubin.pl',
  'lukow.pl',
  'malbork.pl',
  'malopolska.pl',
  'mazowsze.pl',
  'mazury.pl',
  'mielec.pl',
  'mielno.pl',
  'mragowo.pl',
  'naklo.pl',
  'nowaruda.pl',
  'nysa.pl',
  'olawa.pl',
  'olecko.pl',
  'olkusz.pl',
  'olsztyn.pl',
  'opoczno.pl',
  'opole.pl',
  'ostroda.pl',
  'ostroleka.pl',
  'ostrowiec.pl',
  'ostrowwlkp.pl',
  'pila.pl',
  'pisz.pl',
  'podhale.pl',
  'podlasie.pl',
  'polkowice.pl',
  'pomorze.pl',
  'pomorskie.pl',
  'prochowice.pl',
  'pruszkow.pl',
  'przeworsk.pl',
  'pulawy.pl',
  'radom.pl',
  'rawa-maz.pl',
  'rybnik.pl',
  'rzeszow.pl',
  'sanok.pl',
  'sejny.pl',
  'slask.pl',
  'slupsk.pl',
  'sosnowiec.pl',
  'stalowa-wola.pl',
  'skoczow.pl',
  'starachowice.pl',
  'stargard.pl',
  'suwalki.pl',
  'swidnica.pl',
  'swiebodzin.pl',
  'swinoujscie.pl',
  'szczecin.pl',
  'szczytno.pl',
  'tarnobrzeg.pl',
  'tgory.pl',
  'turek.pl',
  'tychy.pl',
  'ustka.pl',
  'walbrzych.pl',
  'warmia.pl',
  'warszawa.pl',
  'waw.pl',
  'wegrow.pl',
  'wielun.pl',
  'wlocl.pl',
  'wloclawek.pl',
  'wodzislaw.pl',
  'wolomin.pl',
  'wroclaw.pl',
  'zachpomor.pl',
  'zagan.pl',
  'zarow.pl',
  'zgora.pl',
  'zgorzelec.pl',
  'pm',
  'pn',
  'gov.pn',
  'co.pn',
  'org.pn',
  'edu.pn',
  'net.pn',
  'post',
  'pr',
  'com.pr',
  'net.pr',
  'org.pr',
  'gov.pr',
  'edu.pr',
  'isla.pr',
  'pro.pr',
  'biz.pr',
  'info.pr',
  'name.pr',
  'est.pr',
  'prof.pr',
  'ac.pr',
  'pro',
  'aaa.pro',
  'aca.pro',
  'acct.pro',
  'avocat.pro',
  'bar.pro',
  'cpa.pro',
  'eng.pro',
  'jur.pro',
  'law.pro',
  'med.pro',
  'recht.pro',
  'ps',
  'edu.ps',
  'gov.ps',
  'sec.ps',
  'plo.ps',
  'com.ps',
  'org.ps',
  'net.ps',
  'pt',
  'net.pt',
  'gov.pt',
  'org.pt',
  'edu.pt',
  'int.pt',
  'publ.pt',
  'com.pt',
  'nome.pt',
  'pw',
  'co.pw',
  'ne.pw',
  'or.pw',
  'ed.pw',
  'go.pw',
  'belau.pw',
  'py',
  'com.py',
  'coop.py',
  'edu.py',
  'gov.py',
  'mil.py',
  'net.py',
  'org.py',
  'qa',
  'com.qa',
  'edu.qa',
  'gov.qa',
  'mil.qa',
  'name.qa',
  'net.qa',
  'org.qa',
  'sch.qa',
  're',
  'asso.re',
  'com.re',
  'nom.re',
  'ro',
  'arts.ro',
  'com.ro',
  'firm.ro',
  'info.ro',
  'nom.ro',
  'nt.ro',
  'org.ro',
  'rec.ro',
  'store.ro',
  'tm.ro',
  'www.ro',
  'rs',
  'ac.rs',
  'co.rs',
  'edu.rs',
  'gov.rs',
  'in.rs',
  'org.rs',
  'ru',
  'rw',
  'ac.rw',
  'co.rw',
  'coop.rw',
  'gov.rw',
  'mil.rw',
  'net.rw',
  'org.rw',
  'sa',
  'com.sa',
  'net.sa',
  'org.sa',
  'gov.sa',
  'med.sa',
  'pub.sa',
  'edu.sa',
  'sch.sa',
  'sb',
  'com.sb',
  'edu.sb',
  'gov.sb',
  'net.sb',
  'org.sb',
  'sc',
  'com.sc',
  'gov.sc',
  'net.sc',
  'org.sc',
  'edu.sc',
  'sd',
  'com.sd',
  'net.sd',
  'org.sd',
  'edu.sd',
  'med.sd',
  'tv.sd',
  'gov.sd',
  'info.sd',
  'se',
  'a.se',
  'ac.se',
  'b.se',
  'bd.se',
  'brand.se',
  'c.se',
  'd.se',
  'e.se',
  'f.se',
  'fh.se',
  'fhsk.se',
  'fhv.se',
  'g.se',
  'h.se',
  'i.se',
  'k.se',
  'komforb.se',
  'kommunalforbund.se',
  'komvux.se',
  'l.se',
  'lanbib.se',
  'm.se',
  'n.se',
  'naturbruksgymn.se',
  'o.se',
  'org.se',
  'p.se',
  'parti.se',
  'pp.se',
  'press.se',
  'r.se',
  's.se',
  't.se',
  'tm.se',
  'u.se',
  'w.se',
  'x.se',
  'y.se',
  'z.se',
  'sg',
  'com.sg',
  'net.sg',
  'org.sg',
  'gov.sg',
  'edu.sg',
  'per.sg',
  'sh',
  'com.sh',
  'net.sh',
  'gov.sh',
  'org.sh',
  'mil.sh',
  'si',
  'sj',
  'sk',
  'sl',
  'com.sl',
  'net.sl',
  'edu.sl',
  'gov.sl',
  'org.sl',
  'sm',
  'sn',
  'art.sn',
  'com.sn',
  'edu.sn',
  'gouv.sn',
  'org.sn',
  'perso.sn',
  'univ.sn',
  'so',
  'com.so',
  'edu.so',
  'gov.so',
  'me.so',
  'net.so',
  'org.so',
  'sr',
  'ss',
  'biz.ss',
  'com.ss',
  'edu.ss',
  'gov.ss',
  'net.ss',
  'org.ss',
  'st',
  'co.st',
  'com.st',
  'consulado.st',
  'edu.st',
  'embaixada.st',
  'gov.st',
  'mil.st',
  'net.st',
  'org.st',
  'principe.st',
  'saotome.st',
  'store.st',
  'su',
  'sv',
  'com.sv',
  'edu.sv',
  'gob.sv',
  'org.sv',
  'red.sv',
  'sx',
  'gov.sx',
  'sy',
  'edu.sy',
  'gov.sy',
  'net.sy',
  'mil.sy',
  'com.sy',
  'org.sy',
  'sz',
  'co.sz',
  'ac.sz',
  'org.sz',
  'tc',
  'td',
  'tel',
  'tf',
  'tg',
  'th',
  'ac.th',
  'co.th',
  'go.th',
  'in.th',
  'mi.th',
  'net.th',
  'or.th',
  'tj',
  'ac.tj',
  'biz.tj',
  'co.tj',
  'com.tj',
  'edu.tj',
  'go.tj',
  'gov.tj',
  'int.tj',
  'mil.tj',
  'name.tj',
  'net.tj',
  'nic.tj',
  'org.tj',
  'test.tj',
  'web.tj',
  'tk',
  'tl',
  'gov.tl',
  'tm',
  'com.tm',
  'co.tm',
  'org.tm',
  'net.tm',
  'nom.tm',
  'gov.tm',
  'mil.tm',
  'edu.tm',
  'tn',
  'com.tn',
  'ens.tn',
  'fin.tn',
  'gov.tn',
  'ind.tn',
  'intl.tn',
  'nat.tn',
  'net.tn',
  'org.tn',
  'info.tn',
  'perso.tn',
  'tourism.tn',
  'edunet.tn',
  'rnrt.tn',
  'rns.tn',
  'rnu.tn',
  'mincom.tn',
  'agrinet.tn',
  'defense.tn',
  'turen.tn',
  'to',
  'com.to',
  'gov.to',
  'net.to',
  'org.to',
  'edu.to',
  'mil.to',
  'tr',
  'av.tr',
  'bbs.tr',
  'bel.tr',
  'biz.tr',
  'com.tr',
  'dr.tr',
  'edu.tr',
  'gen.tr',
  'gov.tr',
  'info.tr',
  'mil.tr',
  'k12.tr',
  'kep.tr',
  'name.tr',
  'net.tr',
  'org.tr',
  'pol.tr',
  'tel.tr',
  'tsk.tr',
  'tv.tr',
  'web.tr',
  'nc.tr',
  'gov.nc.tr',
  'tt',
  'co.tt',
  'com.tt',
  'org.tt',
  'net.tt',
  'biz.tt',
  'info.tt',
  'pro.tt',
  'int.tt',
  'coop.tt',
  'jobs.tt',
  'mobi.tt',
  'travel.tt',
  'museum.tt',
  'aero.tt',
  'name.tt',
  'gov.tt',
  'edu.tt',
  'tv',
  'tw',
  'edu.tw',
  'gov.tw',
  'mil.tw',
  'com.tw',
  'net.tw',
  'org.tw',
  'idv.tw',
  'game.tw',
  'ebiz.tw',
  'club.tw',
  '網路.tw',
  '組織.tw',
  '商業.tw',
  'tz',
  'ac.tz',
  'co.tz',
  'go.tz',
  'hotel.tz',
  'info.tz',
  'me.tz',
  'mil.tz',
  'mobi.tz',
  'ne.tz',
  'or.tz',
  'sc.tz',
  'tv.tz',
  'ua',
  'com.ua',
  'edu.ua',
  'gov.ua',
  'in.ua',
  'net.ua',
  'org.ua',
  'cherkassy.ua',
  'cherkasy.ua',
  'chernigov.ua',
  'chernihiv.ua',
  'chernivtsi.ua',
  'chernovtsy.ua',
  'ck.ua',
  'cn.ua',
  'cr.ua',
  'crimea.ua',
  'cv.ua',
  'dn.ua',
  'dnepropetrovsk.ua',
  'dnipropetrovsk.ua',
  'dominic.ua',
  'donetsk.ua',
  'dp.ua',
  'if.ua',
  'ivano-frankivsk.ua',
  'kh.ua',
  'kharkiv.ua',
  'kharkov.ua',
  'kherson.ua',
  'khmelnitskiy.ua',
  'khmelnytskyi.ua',
  'kiev.ua',
  'kirovograd.ua',
  'km.ua',
  'kr.ua',
  'krym.ua',
  'ks.ua',
  'kv.ua',
  'kyiv.ua',
  'lg.ua',
  'lt.ua',
  'lugansk.ua',
  'lutsk.ua',
  'lv.ua',
  'lviv.ua',
  'mk.ua',
  'mykolaiv.ua',
  'nikolaev.ua',
  'od.ua',
  'odesa.ua',
  'odessa.ua',
  'pl.ua',
  'poltava.ua',
  'rivne.ua',
  'rovno.ua',
  'rv.ua',
  'sb.ua',
  'sebastopol.ua',
  'sevastopol.ua',
  'sm.ua',
  'sumy.ua',
  'te.ua',
  'ternopil.ua',
  'uz.ua',
  'uzhgorod.ua',
  'vinnica.ua',
  'vinnytsia.ua',
  'vn.ua',
  'volyn.ua',
  'yalta.ua',
  'zaporizhzhe.ua',
  'zaporizhzhia.ua',
  'zhitomir.ua',
  'zhytomyr.ua',
  'zp.ua',
  'zt.ua',
  'ug',
  'co.ug',
  'or.ug',
  'ac.ug',
  'sc.ug',
  'go.ug',
  'ne.ug',
  'com.ug',
  'org.ug',
  'uk',
  'ac.uk',
  'co.uk',
  'gov.uk',
  'ltd.uk',
  'me.uk',
  'net.uk',
  'nhs.uk',
  'org.uk',
  'plc.uk',
  'police.uk',
  '*.sch.uk',
  'us',
  'dni.us',
  'fed.us',
  'isa.us',
  'kids.us',
  'nsn.us',
  'ak.us',
  'al.us',
  'ar.us',
  'as.us',
  'az.us',
  'ca.us',
  'co.us',
  'ct.us',
  'dc.us',
  'de.us',
  'fl.us',
  'ga.us',
  'gu.us',
  'hi.us',
  'ia.us',
  'id.us',
  'il.us',
  'in.us',
  'ks.us',
  'ky.us',
  'la.us',
  'ma.us',
  'md.us',
  'me.us',
  'mi.us',
  'mn.us',
  'mo.us',
  'ms.us',
  'mt.us',
  'nc.us',
  'nd.us',
  'ne.us',
  'nh.us',
  'nj.us',
  'nm.us',
  'nv.us',
  'ny.us',
  'oh.us',
  'ok.us',
  'or.us',
  'pa.us',
  'pr.us',
  'ri.us',
  'sc.us',
  'sd.us',
  'tn.us',
  'tx.us',
  'ut.us',
  'vi.us',
  'vt.us',
  'va.us',
  'wa.us',
  'wi.us',
  'wv.us',
  'wy.us',
  'k12.ak.us',
  'k12.al.us',
  'k12.ar.us',
  'k12.as.us',
  'k12.az.us',
  'k12.ca.us',
  'k12.co.us',
  'k12.ct.us',
  'k12.dc.us',
  'k12.de.us',
  'k12.fl.us',
  'k12.ga.us',
  'k12.gu.us',
  'k12.ia.us',
  'k12.id.us',
  'k12.il.us',
  'k12.in.us',
  'k12.ks.us',
  'k12.ky.us',
  'k12.la.us',
  'k12.ma.us',
  'k12.md.us',
  'k12.me.us',
  'k12.mi.us',
  'k12.mn.us',
  'k12.mo.us',
  'k12.ms.us',
  'k12.mt.us',
  'k12.nc.us',
  'k12.ne.us',
  'k12.nh.us',
  'k12.nj.us',
  'k12.nm.us',
  'k12.nv.us',
  'k12.ny.us',
  'k12.oh.us',
  'k12.ok.us',
  'k12.or.us',
  'k12.pa.us',
  'k12.pr.us',
  'k12.ri.us',
  'k12.sc.us',
  'k12.tn.us',
  'k12.tx.us',
  'k12.ut.us',
  'k12.vi.us',
  'k12.vt.us',
  'k12.va.us',
  'k12.wa.us',
  'k12.wi.us',
  'k12.wy.us',
  'cc.ak.us',
  'cc.al.us',
  'cc.ar.us',
  'cc.as.us',
  'cc.az.us',
  'cc.ca.us',
  'cc.co.us',
  'cc.ct.us',
  'cc.dc.us',
  'cc.de.us',
  'cc.fl.us',
  'cc.ga.us',
  'cc.gu.us',
  'cc.hi.us',
  'cc.ia.us',
  'cc.id.us',
  'cc.il.us',
  'cc.in.us',
  'cc.ks.us',
  'cc.ky.us',
  'cc.la.us',
  'cc.ma.us',
  'cc.md.us',
  'cc.me.us',
  'cc.mi.us',
  'cc.mn.us',
  'cc.mo.us',
  'cc.ms.us',
  'cc.mt.us',
  'cc.nc.us',
  'cc.nd.us',
  'cc.ne.us',
  'cc.nh.us',
  'cc.nj.us',
  'cc.nm.us',
  'cc.nv.us',
  'cc.ny.us',
  'cc.oh.us',
  'cc.ok.us',
  'cc.or.us',
  'cc.pa.us',
  'cc.pr.us',
  'cc.ri.us',
  'cc.sc.us',
  'cc.sd.us',
  'cc.tn.us',
  'cc.tx.us',
  'cc.ut.us',
  'cc.vi.us',
  'cc.vt.us',
  'cc.va.us',
  'cc.wa.us',
  'cc.wi.us',
  'cc.wv.us',
  'cc.wy.us',
  'lib.ak.us',
  'lib.al.us',
  'lib.ar.us',
  'lib.as.us',
  'lib.az.us',
  'lib.ca.us',
  'lib.co.us',
  'lib.ct.us',
  'lib.dc.us',
  'lib.fl.us',
  'lib.ga.us',
  'lib.gu.us',
  'lib.hi.us',
  'lib.ia.us',
  'lib.id.us',
  'lib.il.us',
  'lib.in.us',
  'lib.ks.us',
  'lib.ky.us',
  'lib.la.us',
  'lib.ma.us',
  'lib.md.us',
  'lib.me.us',
  'lib.mi.us',
  'lib.mn.us',
  'lib.mo.us',
  'lib.ms.us',
  'lib.mt.us',
  'lib.nc.us',
  'lib.nd.us',
  'lib.ne.us',
  'lib.nh.us',
  'lib.nj.us',
  'lib.nm.us',
  'lib.nv.us',
  'lib.ny.us',
  'lib.oh.us',
  'lib.ok.us',
  'lib.or.us',
  'lib.pa.us',
  'lib.pr.us',
  'lib.ri.us',
  'lib.sc.us',
  'lib.sd.us',
  'lib.tn.us',
  'lib.tx.us',
  'lib.ut.us',
  'lib.vi.us',
  'lib.vt.us',
  'lib.va.us',
  'lib.wa.us',
  'lib.wi.us',
  'lib.wy.us',
  'pvt.k12.ma.us',
  'chtr.k12.ma.us',
  'paroch.k12.ma.us',
  'ann-arbor.mi.us',
  'cog.mi.us',
  'dst.mi.us',
  'eaton.mi.us',
  'gen.mi.us',
  'mus.mi.us',
  'tec.mi.us',
  'washtenaw.mi.us',
  'uy',
  'com.uy',
  'edu.uy',
  'gub.uy',
  'mil.uy',
  'net.uy',
  'org.uy',
  'uz',
  'co.uz',
  'com.uz',
  'net.uz',
  'org.uz',
  'va',
  'vc',
  'com.vc',
  'net.vc',
  'org.vc',
  'gov.vc',
  'mil.vc',
  'edu.vc',
  've',
  'arts.ve',
  'co.ve',
  'com.ve',
  'e12.ve',
  'edu.ve',
  'firm.ve',
  'gob.ve',
  'gov.ve',
  'info.ve',
  'int.ve',
  'mil.ve',
  'net.ve',
  'org.ve',
  'rec.ve',
  'store.ve',
  'tec.ve',
  'web.ve',
  'vg',
  'vi',
  'co.vi',
  'com.vi',
  'k12.vi',
  'net.vi',
  'org.vi',
  'vn',
  'com.vn',
  'net.vn',
  'org.vn',
  'edu.vn',
  'gov.vn',
  'int.vn',
  'ac.vn',
  'biz.vn',
  'info.vn',
  'name.vn',
  'pro.vn',
  'health.vn',
  'vu',
  'com.vu',
  'edu.vu',
  'net.vu',
  'org.vu',
  'wf',
  'ws',
  'com.ws',
  'net.ws',
  'org.ws',
  'gov.ws',
  'edu.ws',
  'yt',
  'امارات',
  'հայ',
  'বাংলা',
  'бг',
  'бел',
  '中国',
  '中國',
  'الجزائر',
  'مصر',
  'ею',
  'موريتانيا',
  'გე',
  'ελ',
  '香港',
  '公司.香港',
  '教育.香港',
  '政府.香港',
  '個人.香港',
  '網絡.香港',
  '組織.香港',
  'ಭಾರತ',
  'ଭାରତ',
  'ভাৰত',
  'भारतम्',
  'भारोत',
  'ڀارت',
  'ഭാരതം',
  'भारत',
  'بارت',
  'بھارت',
  'భారత్',
  'ભારત',
  'ਭਾਰਤ',
  'ভারত',
  'இந்தியா',
  'ایران',
  'ايران',
  'عراق',
  'الاردن',
  '한국',
  'қаз',
  'ලංකා',
  'இலங்கை',
  'المغرب',
  'мкд',
  'мон',
  '澳門',
  '澳门',
  'مليسيا',
  'عمان',
  'پاکستان',
  'پاكستان',
  'فلسطين',
  'срб',
  'пр.срб',
  'орг.срб',
  'обр.срб',
  'од.срб',
  'упр.срб',
  'ак.срб',
  'рф',
  'قطر',
  'السعودية',
  'السعودیة',
  'السعودیۃ',
  'السعوديه',
  'سودان',
  '新加坡',
  'சிங்கப்பூர்',
  'سورية',
  'سوريا',
  'ไทย',
  'ศึกษา.ไทย',
  'ธุรกิจ.ไทย',
  'รัฐบาล.ไทย',
  'ทหาร.ไทย',
  'เน็ต.ไทย',
  'องค์กร.ไทย',
  'تونس',
  '台灣',
  '台湾',
  '臺灣',
  'укр',
  'اليمن',
  'xxx',
  '*.ye',
  'ac.za',
  'agric.za',
  'alt.za',
  'co.za',
  'edu.za',
  'gov.za',
  'grondar.za',
  'law.za',
  'mil.za',
  'net.za',
  'ngo.za',
  'nic.za',
  'nis.za',
  'nom.za',
  'org.za',
  'school.za',
  'tm.za',
  'web.za',
  'zm',
  'ac.zm',
  'biz.zm',
  'co.zm',
  'com.zm',
  'edu.zm',
  'gov.zm',
  'info.zm',
  'mil.zm',
  'net.zm',
  'org.zm',
  'sch.zm',
  'zw',
  'ac.zw',
  'co.zw',
  'gov.zw',
  'mil.zw',
  'org.zw',
  'aaa',
  'aarp',
  'abarth',
  'abb',
  'abbott',
  'abbvie',
  'abc',
  'able',
  'abogado',
  'abudhabi',
  'academy',
  'accenture',
  'accountant',
  'accountants',
  'aco',
  'actor',
  'adac',
  'ads',
  'adult',
  'aeg',
  'aetna',
  'afamilycompany',
  'afl',
  'africa',
  'agakhan',
  'agency',
  'aig',
  'aigo',
  'airbus',
  'airforce',
  'airtel',
  'akdn',
  'alfaromeo',
  'alibaba',
  'alipay',
  'allfinanz',
  'allstate',
  'ally',
  'alsace',
  'alstom',
  'americanexpress',
  'americanfamily',
  'amex',
  'amfam',
  'amica',
  'amsterdam',
  'analytics',
  'android',
  'anquan',
  'anz',
  'aol',
  'apartments',
  'app',
  'apple',
  'aquarelle',
  'arab',
  'aramco',
  'archi',
  'army',
  'art',
  'arte',
  'asda',
  'associates',
  'athleta',
  'attorney',
  'auction',
  'audi',
  'audible',
  'audio',
  'auspost',
  'author',
  'auto',
  'autos',
  'avianca',
  'aws',
  'axa',
  'azure',
  'baby',
  'baidu',
  'banamex',
  'bananarepublic',
  'band',
  'bank',
  'bar',
  'barcelona',
  'barclaycard',
  'barclays',
  'barefoot',
  'bargains',
  'baseball',
  'basketball',
  'bauhaus',
  'bayern',
  'bbc',
  'bbt',
  'bbva',
  'bcg',
  'bcn',
  'beats',
  'beauty',
  'beer',
  'bentley',
  'berlin',
  'best',
  'bestbuy',
  'bet',
  'bharti',
  'bible',
  'bid',
  'bike',
  'bing',
  'bingo',
  'bio',
  'black',
  'blackfriday',
  'blockbuster',
  'blog',
  'bloomberg',
  'blue',
  'bms',
  'bmw',
  'bnpparibas',
  'boats',
  'boehringer',
  'bofa',
  'bom',
  'bond',
  'boo',
  'book',
  'booking',
  'bosch',
  'bostik',
  'boston',
  'bot',
  'boutique',
  'box',
  'bradesco',
  'bridgestone',
  'broadway',
  'broker',
  'brother',
  'brussels',
  'budapest',
  'bugatti',
  'build',
  'builders',
  'business',
  'buy',
  'buzz',
  'bzh',
  'cab',
  'cafe',
  'cal',
  'call',
  'calvinklein',
  'cam',
  'camera',
  'camp',
  'cancerresearch',
  'canon',
  'capetown',
  'capital',
  'capitalone',
  'car',
  'caravan',
  'cards',
  'care',
  'career',
  'careers',
  'cars',
  'casa',
  'case',
  'caseih',
  'cash',
  'casino',
  'catering',
  'catholic',
  'cba',
  'cbn',
  'cbre',
  'cbs',
  'ceb',
  'center',
  'ceo',
  'cern',
  'cfa',
  'cfd',
  'chanel',
  'channel',
  'charity',
  'chase',
  'chat',
  'cheap',
  'chintai',
  'christmas',
  'chrome',
  'church',
  'cipriani',
  'circle',
  'cisco',
  'citadel',
  'citi',
  'citic',
  'city',
  'cityeats',
  'claims',
  'cleaning',
  'click',
  'clinic',
  'clinique',
  'clothing',
  'cloud',
  'club',
  'clubmed',
  'coach',
  'codes',
  'coffee',
  'college',
  'cologne',
  'comcast',
  'commbank',
  'community',
  'company',
  'compare',
  'computer',
  'comsec',
  'condos',
  'construction',
  'consulting',
  'contact',
  'contractors',
  'cooking',
  'cookingchannel',
  'cool',
  'corsica',
  'country',
  'coupon',
  'coupons',
  'courses',
  'cpa',
  'credit',
  'creditcard',
  'creditunion',
  'cricket',
  'crown',
  'crs',
  'cruise',
  'cruises',
  'csc',
  'cuisinella',
  'cymru',
  'cyou',
  'dabur',
  'dad',
  'dance',
  'data',
  'date',
  'dating',
  'datsun',
  'day',
  'dclk',
  'dds',
  'deal',
  'dealer',
  'deals',
  'degree',
  'delivery',
  'dell',
  'deloitte',
  'delta',
  'democrat',
  'dental',
  'dentist',
  'desi',
  'design',
  'dev',
  'dhl',
  'diamonds',
  'diet',
  'digital',
  'direct',
  'directory',
  'discount',
  'discover',
  'dish',
  'diy',
  'dnp',
  'docs',
  'doctor',
  'dog',
  'domains',
  'dot',
  'download',
  'drive',
  'dtv',
  'dubai',
  'duck',
  'dunlop',
  'dupont',
  'durban',
  'dvag',
  'dvr',
  'earth',
  'eat',
  'eco',
  'edeka',
  'education',
  'email',
  'emerck',
  'energy',
  'engineer',
  'engineering',
  'enterprises',
  'epson',
  'equipment',
  'ericsson',
  'erni',
  'esq',
  'estate',
  'esurance',
  'etisalat',
  'eurovision',
  'eus',
  'events',
  'exchange',
  'expert',
  'exposed',
  'express',
  'extraspace',
  'fage',
  'fail',
  'fairwinds',
  'faith',
  'family',
  'fan',
  'fans',
  'farm',
  'farmers',
  'fashion',
  'fast',
  'fedex',
  'feedback',
  'ferrari',
  'ferrero',
  'fiat',
  'fidelity',
  'fido',
  'film',
  'final',
  'finance',
  'financial',
  'fire',
  'firestone',
  'firmdale',
  'fish',
  'fishing',
  'fit',
  'fitness',
  'flickr',
  'flights',
  'flir',
  'florist',
  'flowers',
  'fly',
  'foo',
  'food',
  'foodnetwork',
  'football',
  'ford',
  'forex',
  'forsale',
  'forum',
  'foundation',
  'fox',
  'free',
  'fresenius',
  'frl',
  'frogans',
  'frontdoor',
  'frontier',
  'ftr',
  'fujitsu',
  'fujixerox',
  'fun',
  'fund',
  'furniture',
  'futbol',
  'fyi',
  'gal',
  'gallery',
  'gallo',
  'gallup',
  'game',
  'games',
  'gap',
  'garden',
  'gay',
  'gbiz',
  'gdn',
  'gea',
  'gent',
  'genting',
  'george',
  'ggee',
  'gift',
  'gifts',
  'gives',
  'giving',
  'glade',
  'glass',
  'gle',
  'global',
  'globo',
  'gmail',
  'gmbh',
  'gmo',
  'gmx',
  'godaddy',
  'gold',
  'goldpoint',
  'golf',
  'goo',
  'goodyear',
  'goog',
  'google',
  'gop',
  'got',
  'grainger',
  'graphics',
  'gratis',
  'green',
  'gripe',
  'grocery',
  'group',
  'guardian',
  'gucci',
  'guge',
  'guide',
  'guitars',
  'guru',
  'hair',
  'hamburg',
  'hangout',
  'haus',
  'hbo',
  'hdfc',
  'hdfcbank',
  'health',
  'healthcare',
  'help',
  'helsinki',
  'here',
  'hermes',
  'hgtv',
  'hiphop',
  'hisamitsu',
  'hitachi',
  'hiv',
  'hkt',
  'hockey',
  'holdings',
  'holiday',
  'homedepot',
  'homegoods',
  'homes',
  'homesense',
  'honda',
  'horse',
  'hospital',
  'host',
  'hosting',
  'hot',
  'hoteles',
  'hotels',
  'hotmail',
  'house',
  'how',
  'hsbc',
  'hughes',
  'hyatt',
  'hyundai',
  'ibm',
  'icbc',
  'ice',
  'icu',
  'ieee',
  'ifm',
  'ikano',
  'imamat',
  'imdb',
  'immo',
  'immobilien',
  'inc',
  'industries',
  'infiniti',
  'ing',
  'ink',
  'institute',
  'insurance',
  'insure',
  'intel',
  'international',
  'intuit',
  'investments',
  'ipiranga',
  'irish',
  'ismaili',
  'ist',
  'istanbul',
  'itau',
  'itv',
  'iveco',
  'jaguar',
  'java',
  'jcb',
  'jcp',
  'jeep',
  'jetzt',
  'jewelry',
  'jio',
  'jll',
  'jmp',
  'jnj',
  'joburg',
  'jot',
  'joy',
  'jpmorgan',
  'jprs',
  'juegos',
  'juniper',
  'kaufen',
  'kddi',
  'kerryhotels',
  'kerrylogistics',
  'kerryproperties',
  'kfh',
  'kia',
  'kim',
  'kinder',
  'kindle',
  'kitchen',
  'kiwi',
  'koeln',
  'komatsu',
  'kosher',
  'kpmg',
  'kpn',
  'krd',
  'kred',
  'kuokgroup',
  'kyoto',
  'lacaixa',
  'lamborghini',
  'lamer',
  'lancaster',
  'lancia',
  'land',
  'landrover',
  'lanxess',
  'lasalle',
  'lat',
  'latino',
  'latrobe',
  'law',
  'lawyer',
  'lds',
  'lease',
  'leclerc',
  'lefrak',
  'legal',
  'lego',
  'lexus',
  'lgbt',
  'liaison',
  'lidl',
  'life',
  'lifeinsurance',
  'lifestyle',
  'lighting',
  'like',
  'lilly',
  'limited',
  'limo',
  'lincoln',
  'linde',
  'link',
  'lipsy',
  'live',
  'living',
  'lixil',
  'llc',
  'llp',
  'loan',
  'loans',
  'locker',
  'locus',
  'loft',
  'lol',
  'london',
  'lotte',
  'lotto',
  'love',
  'lpl',
  'lplfinancial',
  'ltd',
  'ltda',
  'lundbeck',
  'lupin',
  'luxe',
  'luxury',
  'macys',
  'madrid',
  'maif',
  'maison',
  'makeup',
  'man',
  'management',
  'mango',
  'map',
  'market',
  'marketing',
  'markets',
  'marriott',
  'marshalls',
  'maserati',
  'mattel',
  'mba',
  'mckinsey',
  'med',
  'media',
  'meet',
  'melbourne',
  'meme',
  'memorial',
  'men',
  'menu',
  'merckmsd',
  'metlife',
  'miami',
  'microsoft',
  'mini',
  'mint',
  'mit',
  'mitsubishi',
  'mlb',
  'mls',
  'mma',
  'mobile',
  'moda',
  'moe',
  'moi',
  'mom',
  'monash',
  'money',
  'monster',
  'mormon',
  'mortgage',
  'moscow',
  'moto',
  'motorcycles',
  'mov',
  'movie',
  'movistar',
  'msd',
  'mtn',
  'mtr',
  'mutual',
  'nab',
  'nadex',
  'nagoya',
  'nationwide',
  'natura',
  'navy',
  'nba',
  'nec',
  'netbank',
  'netflix',
  'network',
  'neustar',
  'new',
  'newholland',
  'news',
  'next',
  'nextdirect',
  'nexus',
  'nfl',
  'ngo',
  'nhk',
  'nico',
  'nike',
  'nikon',
  'ninja',
  'nissan',
  'nissay',
  'nokia',
  'northwesternmutual',
  'norton',
  'now',
  'nowruz',
  'nowtv',
  'nra',
  'nrw',
  'ntt',
  'nyc',
  'obi',
  'observer',
  'off',
  'office',
  'okinawa',
  'olayan',
  'olayangroup',
  'oldnavy',
  'ollo',
  'omega',
  'one',
  'ong',
  'onl',
  'online',
  'onyourside',
  'ooo',
  'open',
  'oracle',
  'orange',
  'organic',
  'origins',
  'osaka',
  'otsuka',
  'ott',
  'ovh',
  'page',
  'panasonic',
  'paris',
  'pars',
  'partners',
  'parts',
  'party',
  'passagens',
  'pay',
  'pccw',
  'pet',
  'pfizer',
  'pharmacy',
  'phd',
  'philips',
  'phone',
  'photo',
  'photography',
  'photos',
  'physio',
  'pics',
  'pictet',
  'pictures',
  'pid',
  'pin',
  'ping',
  'pink',
  'pioneer',
  'pizza',
  'place',
  'play',
  'playstation',
  'plumbing',
  'plus',
  'pnc',
  'pohl',
  'poker',
  'politie',
  'porn',
  'pramerica',
  'praxi',
  'press',
  'prime',
  'prod',
  'productions',
  'prof',
  'progressive',
  'promo',
  'properties',
  'property',
  'protection',
  'pru',
  'prudential',
  'pub',
  'pwc',
  'qpon',
  'quebec',
  'quest',
  'qvc',
  'racing',
  'radio',
  'raid',
  'read',
  'realestate',
  'realtor',
  'realty',
  'recipes',
  'red',
  'redstone',
  'redumbrella',
  'rehab',
  'reise',
  'reisen',
  'reit',
  'reliance',
  'ren',
  'rent',
  'rentals',
  'repair',
  'report',
  'republican',
  'rest',
  'restaurant',
  'review',
  'reviews',
  'rexroth',
  'rich',
  'richardli',
  'ricoh',
  'rightathome',
  'ril',
  'rio',
  'rip',
  'rmit',
  'rocher',
  'rocks',
  'rodeo',
  'rogers',
  'room',
  'rsvp',
  'rugby',
  'ruhr',
  'run',
  'rwe',
  'ryukyu',
  'saarland',
  'safe',
  'safety',
  'sakura',
  'sale',
  'salon',
  'samsclub',
  'samsung',
  'sandvik',
  'sandvikcoromant',
  'sanofi',
  'sap',
  'sarl',
  'sas',
  'save',
  'saxo',
  'sbi',
  'sbs',
  'sca',
  'scb',
  'schaeffler',
  'schmidt',
  'scholarships',
  'school',
  'schule',
  'schwarz',
  'science',
  'scjohnson',
  'scor',
  'scot',
  'search',
  'seat',
  'secure',
  'security',
  'seek',
  'select',
  'sener',
  'services',
  'ses',
  'seven',
  'sew',
  'sex',
  'sexy',
  'sfr',
  'shangrila',
  'sharp',
  'shaw',
  'shell',
  'shia',
  'shiksha',
  'shoes',
  'shop',
  'shopping',
  'shouji',
  'show',
  'showtime',
  'shriram',
  'silk',
  'sina',
  'singles',
  'site',
  'ski',
  'skin',
  'sky',
  'skype',
  'sling',
  'smart',
  'smile',
  'sncf',
  'soccer',
  'social',
  'softbank',
  'software',
  'sohu',
  'solar',
  'solutions',
  'song',
  'sony',
  'soy',
  'spa',
  'space',
  'sport',
  'spot',
  'spreadbetting',
  'srl',
  'stada',
  'staples',
  'star',
  'statebank',
  'statefarm',
  'stc',
  'stcgroup',
  'stockholm',
  'storage',
  'store',
  'stream',
  'studio',
  'study',
  'style',
  'sucks',
  'supplies',
  'supply',
  'support',
  'surf',
  'surgery',
  'suzuki',
  'swatch',
  'swiftcover',
  'swiss',
  'sydney',
  'symantec',
  'systems',
  'tab',
  'taipei',
  'talk',
  'taobao',
  'target',
  'tatamotors',
  'tatar',
  'tattoo',
  'tax',
  'taxi',
  'tci',
  'tdk',
  'team',
  'tech',
  'technology',
  'telefonica',
  'temasek',
  'tennis',
  'teva',
  'thd',
  'theater',
  'theatre',
  'tiaa',
  'tickets',
  'tienda',
  'tiffany',
  'tips',
  'tires',
  'tirol',
  'tjmaxx',
  'tjx',
  'tkmaxx',
  'tmall',
  'today',
  'tokyo',
  'tools',
  'top',
  'toray',
  'toshiba',
  'total',
  'tours',
  'town',
  'toyota',
  'toys',
  'trade',
  'trading',
  'training',
  'travel',
  'travelchannel',
  'travelers',
  'travelersinsurance',
  'trust',
  'trv',
  'tube',
  'tui',
  'tunes',
  'tushu',
  'tvs',
  'ubank',
  'ubs',
  'unicom',
  'university',
  'uno',
  'uol',
  'ups',
  'vacations',
  'vana',
  'vanguard',
  'vegas',
  'ventures',
  'verisign',
  'versicherung',
  'vet',
  'viajes',
  'video',
  'vig',
  'viking',
  'villas',
  'vin',
  'vip',
  'virgin',
  'visa',
  'vision',
  'vistaprint',
  'viva',
  'vivo',
  'vlaanderen',
  'vodka',
  'volkswagen',
  'volvo',
  'vote',
  'voting',
  'voto',
  'voyage',
  'vuelos',
  'wales',
  'walmart',
  'walter',
  'wang',
  'wanggou',
  'watch',
  'watches',
  'weather',
  'weatherchannel',
  'webcam',
  'weber',
  'website',
  'wed',
  'wedding',
  'weibo',
  'weir',
  'whoswho',
  'wien',
  'wiki',
  'williamhill',
  'win',
  'windows',
  'wine',
  'winners',
  'wme',
  'wolterskluwer',
  'woodside',
  'work',
  'works',
  'world',
  'wow',
  'wtc',
  'wtf',
  'xbox',
  'xerox',
  'xfinity',
  'xihuan',
  'xin',
  'कॉम',
  'セール',
  '佛山',
  '慈善',
  '集团',
  '在线',
  '大众汽车',
  '点看',
  'คอม',
  '八卦',
  'موقع',
  '公益',
  '公司',
  '香格里拉',
  '网站',
  '移动',
  '我爱你',
  'москва',
  'католик',
  'онлайн',
  'сайт',
  '联通',
  'קום',
  '时尚',
  '微博',
  '淡马锡',
  'ファッション',
  'орг',
  'नेट',
  'ストア',
  '삼성',
  '商标',
  '商店',
  '商城',
  'дети',
  'ポイント',
  '新闻',
  '工行',
  '家電',
  'كوم',
  '中文网',
  '中信',
  '娱乐',
  '谷歌',
  '電訊盈科',
  '购物',
  'クラウド',
  '通販',
  '网店',
  'संगठन',
  '餐厅',
  '网络',
  'ком',
  '诺基亚',
  '食品',
  '飞利浦',
  '手表',
  '手机',
  'ارامكو',
  'العليان',
  'اتصالات',
  'بازار',
  'ابوظبي',
  'كاثوليك',
  'همراه',
  '닷컴',
  '政府',
  'شبكة',
  'بيتك',
  'عرب',
  '机构',
  '组织机构',
  '健康',
  '招聘',
  'рус',
  '珠宝',
  '大拿',
  'みんな',
  'グーグル',
  '世界',
  '書籍',
  '网址',
  '닷넷',
  'コム',
  '天主教',
  '游戏',
  'vermögensberater',
  'vermögensberatung',
  '企业',
  '信息',
  '嘉里大酒店',
  '嘉里',
  '广东',
  '政务',
  'xyz',
  'yachts',
  'yahoo',
  'yamaxun',
  'yandex',
  'yodobashi',
  'yoga',
  'yokohama',
  'you',
  'youtube',
  'yun',
  'zappos',
  'zara',
  'zero',
  'zip',
  'zone',
  'zuerich',
  'cc.ua',
  'inf.ua',
  'ltd.ua',
  'beep.pl',
  'barsy.ca',
  '*.compute.estate',
  '*.alces.network',
  'altervista.org',
  'alwaysdata.net',
  'cloudfront.net',
  '*.compute.amazonaws.com',
  '*.compute-1.amazonaws.com',
  '*.compute.amazonaws.com.cn',
  'us-east-1.amazonaws.com',
  'cn-north-1.eb.amazonaws.com.cn',
  'cn-northwest-1.eb.amazonaws.com.cn',
  'elasticbeanstalk.com',
  'ap-northeast-1.elasticbeanstalk.com',
  'ap-northeast-2.elasticbeanstalk.com',
  'ap-northeast-3.elasticbeanstalk.com',
  'ap-south-1.elasticbeanstalk.com',
  'ap-southeast-1.elasticbeanstalk.com',
  'ap-southeast-2.elasticbeanstalk.com',
  'ca-central-1.elasticbeanstalk.com',
  'eu-central-1.elasticbeanstalk.com',
  'eu-west-1.elasticbeanstalk.com',
  'eu-west-2.elasticbeanstalk.com',
  'eu-west-3.elasticbeanstalk.com',
  'sa-east-1.elasticbeanstalk.com',
  'us-east-1.elasticbeanstalk.com',
  'us-east-2.elasticbeanstalk.com',
  'us-gov-west-1.elasticbeanstalk.com',
  'us-west-1.elasticbeanstalk.com',
  'us-west-2.elasticbeanstalk.com',
  '*.elb.amazonaws.com',
  '*.elb.amazonaws.com.cn',
  's3.amazonaws.com',
  's3-ap-northeast-1.amazonaws.com',
  's3-ap-northeast-2.amazonaws.com',
  's3-ap-south-1.amazonaws.com',
  's3-ap-southeast-1.amazonaws.com',
  's3-ap-southeast-2.amazonaws.com',
  's3-ca-central-1.amazonaws.com',
  's3-eu-central-1.amazonaws.com',
  's3-eu-west-1.amazonaws.com',
  's3-eu-west-2.amazonaws.com',
  's3-eu-west-3.amazonaws.com',
  's3-external-1.amazonaws.com',
  's3-fips-us-gov-west-1.amazonaws.com',
  's3-sa-east-1.amazonaws.com',
  's3-us-gov-west-1.amazonaws.com',
  's3-us-east-2.amazonaws.com',
  's3-us-west-1.amazonaws.com',
  's3-us-west-2.amazonaws.com',
  's3.ap-northeast-2.amazonaws.com',
  's3.ap-south-1.amazonaws.com',
  's3.cn-north-1.amazonaws.com.cn',
  's3.ca-central-1.amazonaws.com',
  's3.eu-central-1.amazonaws.com',
  's3.eu-west-2.amazonaws.com',
  's3.eu-west-3.amazonaws.com',
  's3.us-east-2.amazonaws.com',
  's3.dualstack.ap-northeast-1.amazonaws.com',
  's3.dualstack.ap-northeast-2.amazonaws.com',
  's3.dualstack.ap-south-1.amazonaws.com',
  's3.dualstack.ap-southeast-1.amazonaws.com',
  's3.dualstack.ap-southeast-2.amazonaws.com',
  's3.dualstack.ca-central-1.amazonaws.com',
  's3.dualstack.eu-central-1.amazonaws.com',
  's3.dualstack.eu-west-1.amazonaws.com',
  's3.dualstack.eu-west-2.amazonaws.com',
  's3.dualstack.eu-west-3.amazonaws.com',
  's3.dualstack.sa-east-1.amazonaws.com',
  's3.dualstack.us-east-1.amazonaws.com',
  's3.dualstack.us-east-2.amazonaws.com',
  's3-website-us-east-1.amazonaws.com',
  's3-website-us-west-1.amazonaws.com',
  's3-website-us-west-2.amazonaws.com',
  's3-website-ap-northeast-1.amazonaws.com',
  's3-website-ap-southeast-1.amazonaws.com',
  's3-website-ap-southeast-2.amazonaws.com',
  's3-website-eu-west-1.amazonaws.com',
  's3-website-sa-east-1.amazonaws.com',
  's3-website.ap-northeast-2.amazonaws.com',
  's3-website.ap-south-1.amazonaws.com',
  's3-website.ca-central-1.amazonaws.com',
  's3-website.eu-central-1.amazonaws.com',
  's3-website.eu-west-2.amazonaws.com',
  's3-website.eu-west-3.amazonaws.com',
  's3-website.us-east-2.amazonaws.com',
  'amsw.nl',
  't3l3p0rt.net',
  'tele.amune.org',
  'apigee.io',
  'on-aptible.com',
  'user.aseinet.ne.jp',
  'gv.vc',
  'd.gv.vc',
  'user.party.eus',
  'pimienta.org',
  'poivron.org',
  'potager.org',
  'sweetpepper.org',
  'myasustor.com',
  'myfritz.net',
  '*.awdev.ca',
  '*.advisor.ws',
  'b-data.io',
  'backplaneapp.io',
  'balena-devices.com',
  'app.banzaicloud.io',
  'betainabox.com',
  'bnr.la',
  'blackbaudcdn.net',
  'boomla.net',
  'boxfuse.io',
  'square7.ch',
  'bplaced.com',
  'bplaced.de',
  'square7.de',
  'bplaced.net',
  'square7.net',
  'browsersafetymark.io',
  'uk0.bigv.io',
  'dh.bytemark.co.uk',
  'vm.bytemark.co.uk',
  'mycd.eu',
  'carrd.co',
  'crd.co',
  'uwu.ai',
  'ae.org',
  'ar.com',
  'br.com',
  'cn.com',
  'com.de',
  'com.se',
  'de.com',
  'eu.com',
  'gb.com',
  'gb.net',
  'hu.com',
  'hu.net',
  'jp.net',
  'jpn.com',
  'kr.com',
  'mex.com',
  'no.com',
  'qc.com',
  'ru.com',
  'sa.com',
  'se.net',
  'uk.com',
  'uk.net',
  'us.com',
  'uy.com',
  'za.bz',
  'za.com',
  'africa.com',
  'gr.com',
  'in.net',
  'us.org',
  'co.com',
  'c.la',
  'certmgr.org',
  'xenapponazure.com',
  'discourse.group',
  'virtueeldomein.nl',
  'cleverapps.io',
  '*.lcl.dev',
  '*.stg.dev',
  'c66.me',
  'cloud66.ws',
  'cloud66.zone',
  'jdevcloud.com',
  'wpdevcloud.com',
  'cloudaccess.host',
  'freesite.host',
  'cloudaccess.net',
  'cloudcontrolled.com',
  'cloudcontrolapp.com',
  'cloudera.site',
  'trycloudflare.com',
  'workers.dev',
  'wnext.app',
  'co.ca',
  '*.otap.co',
  'co.cz',
  'c.cdn77.org',
  'cdn77-ssl.net',
  'r.cdn77.net',
  'rsc.cdn77.org',
  'ssl.origin.cdn77-secure.org',
  'cloudns.asia',
  'cloudns.biz',
  'cloudns.club',
  'cloudns.cc',
  'cloudns.eu',
  'cloudns.in',
  'cloudns.info',
  'cloudns.org',
  'cloudns.pro',
  'cloudns.pw',
  'cloudns.us',
  'cloudeity.net',
  'cnpy.gdn',
  'co.nl',
  'co.no',
  'webhosting.be',
  'hosting-cluster.nl',
  'ac.ru',
  'edu.ru',
  'gov.ru',
  'int.ru',
  'mil.ru',
  'test.ru',
  'dyn.cosidns.de',
  'dynamisches-dns.de',
  'dnsupdater.de',
  'internet-dns.de',
  'l-o-g-i-n.de',
  'dynamic-dns.info',
  'feste-ip.net',
  'knx-server.net',
  'static-access.net',
  'realm.cz',
  '*.cryptonomic.net',
  'cupcake.is',
  '*.customer-oci.com',
  '*.oci.customer-oci.com',
  '*.ocp.customer-oci.com',
  '*.ocs.customer-oci.com',
  'cyon.link',
  'cyon.site',
  'daplie.me',
  'localhost.daplie.me',
  'dattolocal.com',
  'dattorelay.com',
  'dattoweb.com',
  'mydatto.com',
  'dattolocal.net',
  'mydatto.net',
  'biz.dk',
  'co.dk',
  'firm.dk',
  'reg.dk',
  'store.dk',
  '*.dapps.earth',
  '*.bzz.dapps.earth',
  'builtwithdark.com',
  'edgestack.me',
  'debian.net',
  'dedyn.io',
  'dnshome.de',
  'online.th',
  'shop.th',
  'drayddns.com',
  'dreamhosters.com',
  'mydrobo.com',
  'drud.io',
  'drud.us',
  'duckdns.org',
  'dy.fi',
  'tunk.org',
  'dyndns-at-home.com',
  'dyndns-at-work.com',
  'dyndns-blog.com',
  'dyndns-free.com',
  'dyndns-home.com',
  'dyndns-ip.com',
  'dyndns-mail.com',
  'dyndns-office.com',
  'dyndns-pics.com',
  'dyndns-remote.com',
  'dyndns-server.com',
  'dyndns-web.com',
  'dyndns-wiki.com',
  'dyndns-work.com',
  'dyndns.biz',
  'dyndns.info',
  'dyndns.org',
  'dyndns.tv',
  'at-band-camp.net',
  'ath.cx',
  'barrel-of-knowledge.info',
  'barrell-of-knowledge.info',
  'better-than.tv',
  'blogdns.com',
  'blogdns.net',
  'blogdns.org',
  'blogsite.org',
  'boldlygoingnowhere.org',
  'broke-it.net',
  'buyshouses.net',
  'cechire.com',
  'dnsalias.com',
  'dnsalias.net',
  'dnsalias.org',
  'dnsdojo.com',
  'dnsdojo.net',
  'dnsdojo.org',
  'does-it.net',
  'doesntexist.com',
  'doesntexist.org',
  'dontexist.com',
  'dontexist.net',
  'dontexist.org',
  'doomdns.com',
  'doomdns.org',
  'dvrdns.org',
  'dyn-o-saur.com',
  'dynalias.com',
  'dynalias.net',
  'dynalias.org',
  'dynathome.net',
  'dyndns.ws',
  'endofinternet.net',
  'endofinternet.org',
  'endoftheinternet.org',
  'est-a-la-maison.com',
  'est-a-la-masion.com',
  'est-le-patron.com',
  'est-mon-blogueur.com',
  'for-better.biz',
  'for-more.biz',
  'for-our.info',
  'for-some.biz',
  'for-the.biz',
  'forgot.her.name',
  'forgot.his.name',
  'from-ak.com',
  'from-al.com',
  'from-ar.com',
  'from-az.net',
  'from-ca.com',
  'from-co.net',
  'from-ct.com',
  'from-dc.com',
  'from-de.com',
  'from-fl.com',
  'from-ga.com',
  'from-hi.com',
  'from-ia.com',
  'from-id.com',
  'from-il.com',
  'from-in.com',
  'from-ks.com',
  'from-ky.com',
  'from-la.net',
  'from-ma.com',
  'from-md.com',
  'from-me.org',
  'from-mi.com',
  'from-mn.com',
  'from-mo.com',
  'from-ms.com',
  'from-mt.com',
  'from-nc.com',
  'from-nd.com',
  'from-ne.com',
  'from-nh.com',
  'from-nj.com',
  'from-nm.com',
  'from-nv.com',
  'from-ny.net',
  'from-oh.com',
  'from-ok.com',
  'from-or.com',
  'from-pa.com',
  'from-pr.com',
  'from-ri.com',
  'from-sc.com',
  'from-sd.com',
  'from-tn.com',
  'from-tx.com',
  'from-ut.com',
  'from-va.com',
  'from-vt.com',
  'from-wa.com',
  'from-wi.com',
  'from-wv.com',
  'from-wy.com',
  'ftpaccess.cc',
  'fuettertdasnetz.de',
  'game-host.org',
  'game-server.cc',
  'getmyip.com',
  'gets-it.net',
  'go.dyndns.org',
  'gotdns.com',
  'gotdns.org',
  'groks-the.info',
  'groks-this.info',
  'ham-radio-op.net',
  'here-for-more.info',
  'hobby-site.com',
  'hobby-site.org',
  'home.dyndns.org',
  'homedns.org',
  'homeftp.net',
  'homeftp.org',
  'homeip.net',
  'homelinux.com',
  'homelinux.net',
  'homelinux.org',
  'homeunix.com',
  'homeunix.net',
  'homeunix.org',
  'iamallama.com',
  'in-the-band.net',
  'is-a-anarchist.com',
  'is-a-blogger.com',
  'is-a-bookkeeper.com',
  'is-a-bruinsfan.org',
  'is-a-bulls-fan.com',
  'is-a-candidate.org',
  'is-a-caterer.com',
  'is-a-celticsfan.org',
  'is-a-chef.com',
  'is-a-chef.net',
  'is-a-chef.org',
  'is-a-conservative.com',
  'is-a-cpa.com',
  'is-a-cubicle-slave.com',
  'is-a-democrat.com',
  'is-a-designer.com',
  'is-a-doctor.com',
  'is-a-financialadvisor.com',
  'is-a-geek.com',
  'is-a-geek.net',
  'is-a-geek.org',
  'is-a-green.com',
  'is-a-guru.com',
  'is-a-hard-worker.com',
  'is-a-hunter.com',
  'is-a-knight.org',
  'is-a-landscaper.com',
  'is-a-lawyer.com',
  'is-a-liberal.com',
  'is-a-libertarian.com',
  'is-a-linux-user.org',
  'is-a-llama.com',
  'is-a-musician.com',
  'is-a-nascarfan.com',
  'is-a-nurse.com',
  'is-a-painter.com',
  'is-a-patsfan.org',
  'is-a-personaltrainer.com',
  'is-a-photographer.com',
  'is-a-player.com',
  'is-a-republican.com',
  'is-a-rockstar.com',
  'is-a-socialist.com',
  'is-a-soxfan.org',
  'is-a-student.com',
  'is-a-teacher.com',
  'is-a-techie.com',
  'is-a-therapist.com',
  'is-an-accountant.com',
  'is-an-actor.com',
  'is-an-actress.com',
  'is-an-anarchist.com',
  'is-an-artist.com',
  'is-an-engineer.com',
  'is-an-entertainer.com',
  'is-by.us',
  'is-certified.com',
  'is-found.org',
  'is-gone.com',
  'is-into-anime.com',
  'is-into-cars.com',
  'is-into-cartoons.com',
  'is-into-games.com',
  'is-leet.com',
  'is-lost.org',
  'is-not-certified.com',
  'is-saved.org',
  'is-slick.com',
  'is-uberleet.com',
  'is-very-bad.org',
  'is-very-evil.org',
  'is-very-good.org',
  'is-very-nice.org',
  'is-very-sweet.org',
  'is-with-theband.com',
  'isa-geek.com',
  'isa-geek.net',
  'isa-geek.org',
  'isa-hockeynut.com',
  'issmarterthanyou.com',
  'isteingeek.de',
  'istmein.de',
  'kicks-ass.net',
  'kicks-ass.org',
  'knowsitall.info',
  'land-4-sale.us',
  'lebtimnetz.de',
  'leitungsen.de',
  'likes-pie.com',
  'likescandy.com',
  'merseine.nu',
  'mine.nu',
  'misconfused.org',
  'mypets.ws',
  'myphotos.cc',
  'neat-url.com',
  'office-on-the.net',
  'on-the-web.tv',
  'podzone.net',
  'podzone.org',
  'readmyblog.org',
  'saves-the-whales.com',
  'scrapper-site.net',
  'scrapping.cc',
  'selfip.biz',
  'selfip.com',
  'selfip.info',
  'selfip.net',
  'selfip.org',
  'sells-for-less.com',
  'sells-for-u.com',
  'sells-it.net',
  'sellsyourhome.org',
  'servebbs.com',
  'servebbs.net',
  'servebbs.org',
  'serveftp.net',
  'serveftp.org',
  'servegame.org',
  'shacknet.nu',
  'simple-url.com',
  'space-to-rent.com',
  'stuff-4-sale.org',
  'stuff-4-sale.us',
  'teaches-yoga.com',
  'thruhere.net',
  'traeumtgerade.de',
  'webhop.biz',
  'webhop.info',
  'webhop.net',
  'webhop.org',
  'worse-than.tv',
  'writesthisblog.com',
  'ddnss.de',
  'dyn.ddnss.de',
  'dyndns.ddnss.de',
  'dyndns1.de',
  'dyn-ip24.de',
  'home-webserver.de',
  'dyn.home-webserver.de',
  'myhome-server.de',
  'ddnss.org',
  'definima.net',
  'definima.io',
  'bci.dnstrace.pro',
  'ddnsfree.com',
  'ddnsgeek.com',
  'giize.com',
  'gleeze.com',
  'kozow.com',
  'loseyourip.com',
  'ooguy.com',
  'theworkpc.com',
  'casacam.net',
  'dynu.net',
  'accesscam.org',
  'camdvr.org',
  'freeddns.org',
  'mywire.org',
  'webredirect.org',
  'myddns.rocks',
  'blogsite.xyz',
  'dynv6.net',
  'e4.cz',
  'en-root.fr',
  'mytuleap.com',
  'onred.one',
  'staging.onred.one',
  'enonic.io',
  'customer.enonic.io',
  'eu.org',
  'al.eu.org',
  'asso.eu.org',
  'at.eu.org',
  'au.eu.org',
  'be.eu.org',
  'bg.eu.org',
  'ca.eu.org',
  'cd.eu.org',
  'ch.eu.org',
  'cn.eu.org',
  'cy.eu.org',
  'cz.eu.org',
  'de.eu.org',
  'dk.eu.org',
  'edu.eu.org',
  'ee.eu.org',
  'es.eu.org',
  'fi.eu.org',
  'fr.eu.org',
  'gr.eu.org',
  'hr.eu.org',
  'hu.eu.org',
  'ie.eu.org',
  'il.eu.org',
  'in.eu.org',
  'int.eu.org',
  'is.eu.org',
  'it.eu.org',
  'jp.eu.org',
  'kr.eu.org',
  'lt.eu.org',
  'lu.eu.org',
  'lv.eu.org',
  'mc.eu.org',
  'me.eu.org',
  'mk.eu.org',
  'mt.eu.org',
  'my.eu.org',
  'net.eu.org',
  'ng.eu.org',
  'nl.eu.org',
  'no.eu.org',
  'nz.eu.org',
  'paris.eu.org',
  'pl.eu.org',
  'pt.eu.org',
  'q-a.eu.org',
  'ro.eu.org',
  'ru.eu.org',
  'se.eu.org',
  'si.eu.org',
  'sk.eu.org',
  'tr.eu.org',
  'uk.eu.org',
  'us.eu.org',
  'eu-1.evennode.com',
  'eu-2.evennode.com',
  'eu-3.evennode.com',
  'eu-4.evennode.com',
  'us-1.evennode.com',
  'us-2.evennode.com',
  'us-3.evennode.com',
  'us-4.evennode.com',
  'twmail.cc',
  'twmail.net',
  'twmail.org',
  'mymailer.com.tw',
  'url.tw',
  'apps.fbsbx.com',
  'ru.net',
  'adygeya.ru',
  'bashkiria.ru',
  'bir.ru',
  'cbg.ru',
  'com.ru',
  'dagestan.ru',
  'grozny.ru',
  'kalmykia.ru',
  'kustanai.ru',
  'marine.ru',
  'mordovia.ru',
  'msk.ru',
  'mytis.ru',
  'nalchik.ru',
  'nov.ru',
  'pyatigorsk.ru',
  'spb.ru',
  'vladikavkaz.ru',
  'vladimir.ru',
  'abkhazia.su',
  'adygeya.su',
  'aktyubinsk.su',
  'arkhangelsk.su',
  'armenia.su',
  'ashgabad.su',
  'azerbaijan.su',
  'balashov.su',
  'bashkiria.su',
  'bryansk.su',
  'bukhara.su',
  'chimkent.su',
  'dagestan.su',
  'east-kazakhstan.su',
  'exnet.su',
  'georgia.su',
  'grozny.su',
  'ivanovo.su',
  'jambyl.su',
  'kalmykia.su',
  'kaluga.su',
  'karacol.su',
  'karaganda.su',
  'karelia.su',
  'khakassia.su',
  'krasnodar.su',
  'kurgan.su',
  'kustanai.su',
  'lenug.su',
  'mangyshlak.su',
  'mordovia.su',
  'msk.su',
  'murmansk.su',
  'nalchik.su',
  'navoi.su',
  'north-kazakhstan.su',
  'nov.su',
  'obninsk.su',
  'penza.su',
  'pokrovsk.su',
  'sochi.su',
  'spb.su',
  'tashkent.su',
  'termez.su',
  'togliatti.su',
  'troitsk.su',
  'tselinograd.su',
  'tula.su',
  'tuva.su',
  'vladikavkaz.su',
  'vladimir.su',
  'vologda.su',
  'channelsdvr.net',
  'fastly-terrarium.com',
  'fastlylb.net',
  'map.fastlylb.net',
  'freetls.fastly.net',
  'map.fastly.net',
  'a.prod.fastly.net',
  'global.prod.fastly.net',
  'a.ssl.fastly.net',
  'b.ssl.fastly.net',
  'global.ssl.fastly.net',
  'fastpanel.direct',
  'fastvps-server.com',
  'fhapp.xyz',
  'fedorainfracloud.org',
  'fedorapeople.org',
  'cloud.fedoraproject.org',
  'app.os.fedoraproject.org',
  'app.os.stg.fedoraproject.org',
  'mydobiss.com',
  'filegear.me',
  'filegear-au.me',
  'filegear-de.me',
  'filegear-gb.me',
  'filegear-ie.me',
  'filegear-jp.me',
  'filegear-sg.me',
  'firebaseapp.com',
  'flynnhub.com',
  'flynnhosting.net',
  '0e.vc',
  'freebox-os.com',
  'freeboxos.com',
  'fbx-os.fr',
  'fbxos.fr',
  'freebox-os.fr',
  'freeboxos.fr',
  'freedesktop.org',
  '*.futurecms.at',
  '*.ex.futurecms.at',
  '*.in.futurecms.at',
  'futurehosting.at',
  'futuremailing.at',
  '*.ex.ortsinfo.at',
  '*.kunden.ortsinfo.at',
  '*.statics.cloud',
  'service.gov.uk',
  'gehirn.ne.jp',
  'usercontent.jp',
  'gentapps.com',
  'lab.ms',
  'github.io',
  'githubusercontent.com',
  'gitlab.io',
  'glitch.me',
  'lolipop.io',
  'cloudapps.digital',
  'london.cloudapps.digital',
  'homeoffice.gov.uk',
  'ro.im',
  'shop.ro',
  'goip.de',
  'run.app',
  'a.run.app',
  'web.app',
  '*.0emm.com',
  'appspot.com',
  '*.r.appspot.com',
  'blogspot.ae',
  'blogspot.al',
  'blogspot.am',
  'blogspot.ba',
  'blogspot.be',
  'blogspot.bg',
  'blogspot.bj',
  'blogspot.ca',
  'blogspot.cf',
  'blogspot.ch',
  'blogspot.cl',
  'blogspot.co.at',
  'blogspot.co.id',
  'blogspot.co.il',
  'blogspot.co.ke',
  'blogspot.co.nz',
  'blogspot.co.uk',
  'blogspot.co.za',
  'blogspot.com',
  'blogspot.com.ar',
  'blogspot.com.au',
  'blogspot.com.br',
  'blogspot.com.by',
  'blogspot.com.co',
  'blogspot.com.cy',
  'blogspot.com.ee',
  'blogspot.com.eg',
  'blogspot.com.es',
  'blogspot.com.mt',
  'blogspot.com.ng',
  'blogspot.com.tr',
  'blogspot.com.uy',
  'blogspot.cv',
  'blogspot.cz',
  'blogspot.de',
  'blogspot.dk',
  'blogspot.fi',
  'blogspot.fr',
  'blogspot.gr',
  'blogspot.hk',
  'blogspot.hr',
  'blogspot.hu',
  'blogspot.ie',
  'blogspot.in',
  'blogspot.is',
  'blogspot.it',
  'blogspot.jp',
  'blogspot.kr',
  'blogspot.li',
  'blogspot.lt',
  'blogspot.lu',
  'blogspot.md',
  'blogspot.mk',
  'blogspot.mr',
  'blogspot.mx',
  'blogspot.my',
  'blogspot.nl',
  'blogspot.no',
  'blogspot.pe',
  'blogspot.pt',
  'blogspot.qa',
  'blogspot.re',
  'blogspot.ro',
  'blogspot.rs',
  'blogspot.ru',
  'blogspot.se',
  'blogspot.sg',
  'blogspot.si',
  'blogspot.sk',
  'blogspot.sn',
  'blogspot.td',
  'blogspot.tw',
  'blogspot.ug',
  'blogspot.vn',
  'cloudfunctions.net',
  'cloud.goog',
  'codespot.com',
  'googleapis.com',
  'googlecode.com',
  'pagespeedmobilizer.com',
  'publishproxy.com',
  'withgoogle.com',
  'withyoutube.com',
  'awsmppl.com',
  'fin.ci',
  'free.hr',
  'caa.li',
  'ua.rs',
  'conf.se',
  'hs.zone',
  'hs.run',
  'hashbang.sh',
  'hasura.app',
  'hasura-app.io',
  'hepforge.org',
  'herokuapp.com',
  'herokussl.com',
  'myravendb.com',
  'ravendb.community',
  'ravendb.me',
  'development.run',
  'ravendb.run',
  'bpl.biz',
  'orx.biz',
  'ng.city',
  'biz.gl',
  'ng.ink',
  'col.ng',
  'firm.ng',
  'gen.ng',
  'ltd.ng',
  'ngo.ng',
  'ng.school',
  'sch.so',
  'häkkinen.fi',
  '*.moonscale.io',
  'moonscale.net',
  'iki.fi',
  'dyn-berlin.de',
  'in-berlin.de',
  'in-brb.de',
  'in-butter.de',
  'in-dsl.de',
  'in-dsl.net',
  'in-dsl.org',
  'in-vpn.de',
  'in-vpn.net',
  'in-vpn.org',
  'biz.at',
  'info.at',
  'info.cx',
  'ac.leg.br',
  'al.leg.br',
  'am.leg.br',
  'ap.leg.br',
  'ba.leg.br',
  'ce.leg.br',
  'df.leg.br',
  'es.leg.br',
  'go.leg.br',
  'ma.leg.br',
  'mg.leg.br',
  'ms.leg.br',
  'mt.leg.br',
  'pa.leg.br',
  'pb.leg.br',
  'pe.leg.br',
  'pi.leg.br',
  'pr.leg.br',
  'rj.leg.br',
  'rn.leg.br',
  'ro.leg.br',
  'rr.leg.br',
  'rs.leg.br',
  'sc.leg.br',
  'se.leg.br',
  'sp.leg.br',
  'to.leg.br',
  'pixolino.com',
  'ipifony.net',
  'mein-iserv.de',
  'test-iserv.de',
  'iserv.dev',
  'iobb.net',
  'myjino.ru',
  '*.hosting.myjino.ru',
  '*.landing.myjino.ru',
  '*.spectrum.myjino.ru',
  '*.vps.myjino.ru',
  '*.triton.zone',
  '*.cns.joyent.com',
  'js.org',
  'kaas.gg',
  'khplay.nl',
  'keymachine.de',
  'kinghost.net',
  'uni5.net',
  'knightpoint.systems',
  'oya.to',
  'co.krd',
  'edu.krd',
  'git-repos.de',
  'lcube-server.de',
  'svn-repos.de',
  'leadpages.co',
  'lpages.co',
  'lpusercontent.com',
  'lelux.site',
  'co.business',
  'co.education',
  'co.events',
  'co.financial',
  'co.network',
  'co.place',
  'co.technology',
  'app.lmpm.com',
  'linkitools.space',
  'linkyard.cloud',
  'linkyard-cloud.ch',
  'members.linode.com',
  'nodebalancer.linode.com',
  'we.bs',
  'loginline.app',
  'loginline.dev',
  'loginline.io',
  'loginline.services',
  'loginline.site',
  'krasnik.pl',
  'leczna.pl',
  'lubartow.pl',
  'lublin.pl',
  'poniatowa.pl',
  'swidnik.pl',
  'uklugs.org',
  'glug.org.uk',
  'lug.org.uk',
  'lugs.org.uk',
  'barsy.bg',
  'barsy.co.uk',
  'barsyonline.co.uk',
  'barsycenter.com',
  'barsyonline.com',
  'barsy.club',
  'barsy.de',
  'barsy.eu',
  'barsy.in',
  'barsy.info',
  'barsy.io',
  'barsy.me',
  'barsy.menu',
  'barsy.mobi',
  'barsy.net',
  'barsy.online',
  'barsy.org',
  'barsy.pro',
  'barsy.pub',
  'barsy.shop',
  'barsy.site',
  'barsy.support',
  'barsy.uk',
  '*.magentosite.cloud',
  'mayfirst.info',
  'mayfirst.org',
  'hb.cldmail.ru',
  'miniserver.com',
  'memset.net',
  'cloud.metacentrum.cz',
  'custom.metacentrum.cz',
  'flt.cloud.muni.cz',
  'usr.cloud.muni.cz',
  'meteorapp.com',
  'eu.meteorapp.com',
  'co.pl',
  'azurecontainer.io',
  'azurewebsites.net',
  'azure-mobile.net',
  'cloudapp.net',
  'mozilla-iot.org',
  'bmoattachments.org',
  'net.ru',
  'org.ru',
  'pp.ru',
  'ui.nabu.casa',
  'pony.club',
  'of.fashion',
  'on.fashion',
  'of.football',
  'in.london',
  'of.london',
  'for.men',
  'and.mom',
  'for.mom',
  'for.one',
  'for.sale',
  'of.work',
  'to.work',
  'nctu.me',
  'bitballoon.com',
  'netlify.com',
  '4u.com',
  'ngrok.io',
  'nh-serv.co.uk',
  'nfshost.com',
  'dnsking.ch',
  'mypi.co',
  'n4t.co',
  '001www.com',
  'ddnslive.com',
  'myiphost.com',
  'forumz.info',
  '16-b.it',
  '32-b.it',
  '64-b.it',
  'soundcast.me',
  'tcp4.me',
  'dnsup.net',
  'hicam.net',
  'now-dns.net',
  'ownip.net',
  'vpndns.net',
  'dynserv.org',
  'now-dns.org',
  'x443.pw',
  'now-dns.top',
  'ntdll.top',
  'freeddns.us',
  'crafting.xyz',
  'zapto.xyz',
  'nsupdate.info',
  'nerdpol.ovh',
  'blogsyte.com',
  'brasilia.me',
  'cable-modem.org',
  'ciscofreak.com',
  'collegefan.org',
  'couchpotatofries.org',
  'damnserver.com',
  'ddns.me',
  'ditchyourip.com',
  'dnsfor.me',
  'dnsiskinky.com',
  'dvrcam.info',
  'dynns.com',
  'eating-organic.net',
  'fantasyleague.cc',
  'geekgalaxy.com',
  'golffan.us',
  'health-carereform.com',
  'homesecuritymac.com',
  'homesecuritypc.com',
  'hopto.me',
  'ilovecollege.info',
  'loginto.me',
  'mlbfan.org',
  'mmafan.biz',
  'myactivedirectory.com',
  'mydissent.net',
  'myeffect.net',
  'mymediapc.net',
  'mypsx.net',
  'mysecuritycamera.com',
  'mysecuritycamera.net',
  'mysecuritycamera.org',
  'net-freaks.com',
  'nflfan.org',
  'nhlfan.net',
  'no-ip.ca',
  'no-ip.co.uk',
  'no-ip.net',
  'noip.us',
  'onthewifi.com',
  'pgafan.net',
  'point2this.com',
  'pointto.us',
  'privatizehealthinsurance.net',
  'quicksytes.com',
  'read-books.org',
  'securitytactics.com',
  'serveexchange.com',
  'servehumour.com',
  'servep2p.com',
  'servesarcasm.com',
  'stufftoread.com',
  'ufcfan.org',
  'unusualperson.com',
  'workisboring.com',
  '3utilities.com',
  'bounceme.net',
  'ddns.net',
  'ddnsking.com',
  'gotdns.ch',
  'hopto.org',
  'myftp.biz',
  'myftp.org',
  'myvnc.com',
  'no-ip.biz',
  'no-ip.info',
  'no-ip.org',
  'noip.me',
  'redirectme.net',
  'servebeer.com',
  'serveblog.net',
  'servecounterstrike.com',
  'serveftp.com',
  'servegame.com',
  'servehalflife.com',
  'servehttp.com',
  'serveirc.com',
  'serveminecraft.net',
  'servemp3.com',
  'servepics.com',
  'servequake.com',
  'sytes.net',
  'webhop.me',
  'zapto.org',
  'stage.nodeart.io',
  'nodum.co',
  'nodum.io',
  'pcloud.host',
  'nyc.mn',
  'nom.ae',
  'nom.af',
  'nom.ai',
  'nom.al',
  'nym.by',
  'nym.bz',
  'nom.cl',
  'nym.ec',
  'nom.gd',
  'nom.ge',
  'nom.gl',
  'nym.gr',
  'nom.gt',
  'nym.gy',
  'nym.hk',
  'nom.hn',
  'nym.ie',
  'nom.im',
  'nom.ke',
  'nym.kz',
  'nym.la',
  'nym.lc',
  'nom.li',
  'nym.li',
  'nym.lt',
  'nym.lu',
  'nym.me',
  'nom.mk',
  'nym.mn',
  'nym.mx',
  'nom.nu',
  'nym.nz',
  'nym.pe',
  'nym.pt',
  'nom.pw',
  'nom.qa',
  'nym.ro',
  'nom.rs',
  'nom.si',
  'nym.sk',
  'nom.st',
  'nym.su',
  'nym.sx',
  'nom.tj',
  'nym.tw',
  'nom.ug',
  'nom.uy',
  'nom.vc',
  'nom.vg',
  'cya.gg',
  'cloudycluster.net',
  'nid.io',
  'opencraft.hosting',
  'operaunite.com',
  'skygearapp.com',
  'outsystemscloud.com',
  'ownprovider.com',
  'own.pm',
  'ox.rs',
  'oy.lc',
  'pgfog.com',
  'pagefrontapp.com',
  'art.pl',
  'gliwice.pl',
  'krakow.pl',
  'poznan.pl',
  'wroc.pl',
  'zakopane.pl',
  'pantheonsite.io',
  'gotpantheon.com',
  'mypep.link',
  'perspecta.cloud',
  'on-web.fr',
  '*.platform.sh',
  '*.platformsh.site',
  'dyn53.io',
  'co.bn',
  'xen.prgmr.com',
  'priv.at',
  'prvcy.page',
  '*.dweb.link',
  'protonet.io',
  'chirurgiens-dentistes-en-france.fr',
  'byen.site',
  'pubtls.org',
  'qualifioapp.com',
  'instantcloud.cn',
  'ras.ru',
  'qa2.com',
  'qcx.io',
  '*.sys.qcx.io',
  'dev-myqnapcloud.com',
  'alpha-myqnapcloud.com',
  'myqnapcloud.com',
  '*.quipelements.com',
  'vapor.cloud',
  'vaporcloud.io',
  'rackmaze.com',
  'rackmaze.net',
  '*.on-k3s.io',
  '*.on-rancher.cloud',
  '*.on-rio.io',
  'readthedocs.io',
  'rhcloud.com',
  'app.render.com',
  'onrender.com',
  'repl.co',
  'repl.run',
  'resindevice.io',
  'devices.resinstaging.io',
  'hzc.io',
  'wellbeingzone.eu',
  'ptplus.fit',
  'wellbeingzone.co.uk',
  'git-pages.rit.edu',
  'sandcats.io',
  'logoip.de',
  'logoip.com',
  'schokokeks.net',
  'gov.scot',
  'scrysec.com',
  'firewall-gateway.com',
  'firewall-gateway.de',
  'my-gateway.de',
  'my-router.de',
  'spdns.de',
  'spdns.eu',
  'firewall-gateway.net',
  'my-firewall.org',
  'myfirewall.org',
  'spdns.org',
  'biz.ua',
  'co.ua',
  'pp.ua',
  'shiftedit.io',
  'myshopblocks.com',
  'shopitsite.com',
  'mo-siemens.io',
  '1kapp.com',
  'appchizi.com',
  'applinzi.com',
  'sinaapp.com',
  'vipsinaapp.com',
  'siteleaf.net',
  'bounty-full.com',
  'alpha.bounty-full.com',
  'beta.bounty-full.com',
  'stackhero-network.com',
  'static.land',
  'dev.static.land',
  'sites.static.land',
  'apps.lair.io',
  '*.stolos.io',
  'spacekit.io',
  'customer.speedpartner.de',
  'api.stdlib.com',
  'storj.farm',
  'utwente.io',
  'soc.srcf.net',
  'user.srcf.net',
  'temp-dns.com',
  'applicationcloud.io',
  'scapp.io',
  '*.s5y.io',
  '*.sensiosite.cloud',
  'syncloud.it',
  'diskstation.me',
  'dscloud.biz',
  'dscloud.me',
  'dscloud.mobi',
  'dsmynas.com',
  'dsmynas.net',
  'dsmynas.org',
  'familyds.com',
  'familyds.net',
  'familyds.org',
  'i234.me',
  'myds.me',
  'synology.me',
  'vpnplus.to',
  'direct.quickconnect.to',
  'taifun-dns.de',
  'gda.pl',
  'gdansk.pl',
  'gdynia.pl',
  'med.pl',
  'sopot.pl',
  'edugit.org',
  'telebit.app',
  'telebit.io',
  '*.telebit.xyz',
  'gwiddle.co.uk',
  'thingdustdata.com',
  'cust.dev.thingdust.io',
  'cust.disrec.thingdust.io',
  'cust.prod.thingdust.io',
  'cust.testing.thingdust.io',
  'arvo.network',
  'azimuth.network',
  'bloxcms.com',
  'townnews-staging.com',
  '12hp.at',
  '2ix.at',
  '4lima.at',
  'lima-city.at',
  '12hp.ch',
  '2ix.ch',
  '4lima.ch',
  'lima-city.ch',
  'trafficplex.cloud',
  'de.cool',
  '12hp.de',
  '2ix.de',
  '4lima.de',
  'lima-city.de',
  '1337.pictures',
  'clan.rip',
  'lima-city.rocks',
  'webspace.rocks',
  'lima.zone',
  '*.transurl.be',
  '*.transurl.eu',
  '*.transurl.nl',
  'tuxfamily.org',
  'dd-dns.de',
  'diskstation.eu',
  'diskstation.org',
  'dray-dns.de',
  'draydns.de',
  'dyn-vpn.de',
  'dynvpn.de',
  'mein-vigor.de',
  'my-vigor.de',
  'my-wan.de',
  'syno-ds.de',
  'synology-diskstation.de',
  'synology-ds.de',
  'uber.space',
  '*.uberspace.de',
  'hk.com',
  'hk.org',
  'ltd.hk',
  'inc.hk',
  'virtualuser.de',
  'virtual-user.de',
  'lib.de.us',
  '2038.io',
  'router.management',
  'v-info.info',
  'voorloper.cloud',
  'wafflecell.com',
  '*.webhare.dev',
  'wedeploy.io',
  'wedeploy.me',
  'wedeploy.sh',
  'remotewd.com',
  'wmflabs.org',
  'half.host',
  'xnbay.com',
  'u2.xnbay.com',
  'u2-local.xnbay.com',
  'cistron.nl',
  'demon.nl',
  'xs4all.space',
  'yandexcloud.net',
  'storage.yandexcloud.net',
  'website.yandexcloud.net',
  'official.academy',
  'yolasite.com',
  'ybo.faith',
  'yombo.me',
  'homelink.one',
  'ybo.party',
  'ybo.review',
  'ybo.science',
  'ybo.trade',
  'nohost.me',
  'noho.st',
  'za.net',
  'za.org',
  'now.sh',
  'bss.design',
  'basicserver.io',
  'virtualserver.io',
  'site.builder.nu',
  'enterprisecloud.nu'
];

/*eslint no-var:0, prefer-arrow-callback: 0, object-shorthand: 0 */

var psl = _commonjsHelpers.createCommonjsModule(function(module, exports) {
  var internals = {};

  //
  // Read rules from file.
  //
  internals.rules = require$$0.map(function(rule) {
    return {
      rule: rule,
      suffix: rule.replace(/^(\*\.|\!)/, ''),
      punySuffix: -1,
      wildcard: rule.charAt(0) === '*',
      exception: rule.charAt(0) === '!'
    };
  });

  //
  // Check is given string ends with `suffix`.
  //
  internals.endsWith = function(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
  };

  //
  // Find rule for a given domain.
  //
  internals.findRule = function(domain) {
    var punyDomain = Punycode__default['default'].toASCII(domain);
    return internals.rules.reduce(function(memo, rule) {
      if (rule.punySuffix === -1) {
        rule.punySuffix = Punycode__default['default'].toASCII(rule.suffix);
      }
      if (!internals.endsWith(punyDomain, '.' + rule.punySuffix) && punyDomain !== rule.punySuffix) {
        return memo;
      }
      // This has been commented out as it never seems to run. This is because
      // sub tlds always appear after their parents and we never find a shorter
      // match.
      //if (memo) {
      //  var memoSuffix = Punycode.toASCII(memo.suffix);
      //  if (memoSuffix.length >= punySuffix.length) {
      //    return memo;
      //  }
      //}
      return rule;
    }, null);
  };

  //
  // Error codes and messages.
  //
  exports.errorCodes = {
    DOMAIN_TOO_SHORT: 'Domain name too short.',
    DOMAIN_TOO_LONG: 'Domain name too long. It should be no more than 255 chars.',
    LABEL_STARTS_WITH_DASH: 'Domain name label can not start with a dash.',
    LABEL_ENDS_WITH_DASH: 'Domain name label can not end with a dash.',
    LABEL_TOO_LONG: 'Domain name label should be at most 63 chars long.',
    LABEL_TOO_SHORT: 'Domain name label should be at least 1 character long.',
    LABEL_INVALID_CHARS: 'Domain name label can only contain alphanumeric characters or dashes.'
  };

  //
  // Validate domain name and throw if not valid.
  //
  // From wikipedia:
  //
  // Hostnames are composed of series of labels concatenated with dots, as are all
  // domain names. Each label must be between 1 and 63 characters long, and the
  // entire hostname (including the delimiting dots) has a maximum of 255 chars.
  //
  // Allowed chars:
  //
  // * `a-z`
  // * `0-9`
  // * `-` but not as a starting or ending character
  // * `.` as a separator for the textual portions of a domain name
  //
  // * http://en.wikipedia.org/wiki/Domain_name
  // * http://en.wikipedia.org/wiki/Hostname
  //
  internals.validate = function(input) {
    // Before we can validate we need to take care of IDNs with unicode chars.
    var ascii = Punycode__default['default'].toASCII(input);

    if (ascii.length < 1) {
      return 'DOMAIN_TOO_SHORT';
    }
    if (ascii.length > 255) {
      return 'DOMAIN_TOO_LONG';
    }

    // Check each part's length and allowed chars.
    var labels = ascii.split('.');
    var label;

    for (var i = 0; i < labels.length; ++i) {
      label = labels[i];
      if (!label.length) {
        return 'LABEL_TOO_SHORT';
      }
      if (label.length > 63) {
        return 'LABEL_TOO_LONG';
      }
      if (label.charAt(0) === '-') {
        return 'LABEL_STARTS_WITH_DASH';
      }
      if (label.charAt(label.length - 1) === '-') {
        return 'LABEL_ENDS_WITH_DASH';
      }
      if (!/^[a-z0-9\-]+$/.test(label)) {
        return 'LABEL_INVALID_CHARS';
      }
    }
  };

  //
  // Public API
  //

  //
  // Parse domain.
  //
  exports.parse = function(input) {
    if (typeof input !== 'string') {
      throw new TypeError('Domain name must be a string.');
    }

    // Force domain to lowercase.
    var domain = input.slice(0).toLowerCase();

    // Handle FQDN.
    // TODO: Simply remove trailing dot?
    if (domain.charAt(domain.length - 1) === '.') {
      domain = domain.slice(0, domain.length - 1);
    }

    // Validate and sanitise input.
    var error = internals.validate(domain);
    if (error) {
      return {
        input: input,
        error: {
          message: exports.errorCodes[error],
          code: error
        }
      };
    }

    var parsed = {
      input: input,
      tld: null,
      sld: null,
      domain: null,
      subdomain: null,
      listed: false
    };

    var domainParts = domain.split('.');

    // Non-Internet TLD
    if (domainParts[domainParts.length - 1] === 'local') {
      return parsed;
    }

    var handlePunycode = function() {
      if (!/xn--/.test(domain)) {
        return parsed;
      }
      if (parsed.domain) {
        parsed.domain = Punycode__default['default'].toASCII(parsed.domain);
      }
      if (parsed.subdomain) {
        parsed.subdomain = Punycode__default['default'].toASCII(parsed.subdomain);
      }
      return parsed;
    };

    var rule = internals.findRule(domain);

    // Unlisted tld.
    if (!rule) {
      if (domainParts.length < 2) {
        return parsed;
      }
      parsed.tld = domainParts.pop();
      parsed.sld = domainParts.pop();
      parsed.domain = [parsed.sld, parsed.tld].join('.');
      if (domainParts.length) {
        parsed.subdomain = domainParts.pop();
      }
      return handlePunycode();
    }

    // At this point we know the public suffix is listed.
    parsed.listed = true;

    var tldParts = rule.suffix.split('.');
    var privateParts = domainParts.slice(0, domainParts.length - tldParts.length);

    if (rule.exception) {
      privateParts.push(tldParts.shift());
    }

    parsed.tld = tldParts.join('.');

    if (!privateParts.length) {
      return handlePunycode();
    }

    if (rule.wildcard) {
      tldParts.unshift(privateParts.pop());
      parsed.tld = tldParts.join('.');
    }

    if (!privateParts.length) {
      return handlePunycode();
    }

    parsed.sld = privateParts.pop();
    parsed.domain = [parsed.sld, parsed.tld].join('.');

    if (privateParts.length) {
      parsed.subdomain = privateParts.join('.');
    }

    return handlePunycode();
  };

  //
  // Get domain.
  //
  exports.get = function(domain) {
    if (!domain) {
      return null;
    }
    return exports.parse(domain).domain || null;
  };

  //
  // Check whether domain belongs to a known public suffix.
  //
  exports.isValid = function(domain) {
    var parsed = exports.parse(domain);
    return Boolean(parsed.domain && parsed.listed);
  };
});

/*!
 * Copyright (c) 2018, Salesforce.com, Inc.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice,
 * this list of conditions and the following disclaimer.
 *
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 * this list of conditions and the following disclaimer in the documentation
 * and/or other materials provided with the distribution.
 *
 * 3. Neither the name of Salesforce.com nor the names of its contributors may
 * be used to endorse or promote products derived from this software without
 * specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 */

function getPublicSuffix(domain) {
  return psl.get(domain);
}

var getPublicSuffix_1 = getPublicSuffix;

var pubsuffixPsl = {
  getPublicSuffix: getPublicSuffix_1
};

/*!
 * Copyright (c) 2015, Salesforce.com, Inc.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice,
 * this list of conditions and the following disclaimer.
 *
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 * this list of conditions and the following disclaimer in the documentation
 * and/or other materials provided with the distribution.
 *
 * 3. Neither the name of Salesforce.com nor the names of its contributors may
 * be used to endorse or promote products derived from this software without
 * specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 */
/*jshint unused:false */

function Store() {}
var Store_1 = Store;

// Stores may be synchronous, but are still required to use a
// Continuation-Passing Style API.  The CookieJar itself will expose a "*Sync"
// API that converts from synchronous-callbacks to imperative style.
Store.prototype.synchronous = false;

Store.prototype.findCookie = function(domain, path, key, cb) {
  throw new Error('findCookie is not implemented');
};

Store.prototype.findCookies = function(domain, path, cb) {
  throw new Error('findCookies is not implemented');
};

Store.prototype.putCookie = function(cookie, cb) {
  throw new Error('putCookie is not implemented');
};

Store.prototype.updateCookie = function(oldCookie, newCookie, cb) {
  // recommended default implementation:
  // return this.putCookie(newCookie, cb);
  throw new Error('updateCookie is not implemented');
};

Store.prototype.removeCookie = function(domain, path, key, cb) {
  throw new Error('removeCookie is not implemented');
};

Store.prototype.removeCookies = function(domain, path, cb) {
  throw new Error('removeCookies is not implemented');
};

Store.prototype.getAllCookies = function(cb) {
  throw new Error('getAllCookies is not implemented (therefore jar cannot be serialized)');
};

var store = {
  Store: Store_1
};

/*!
 * Copyright (c) 2015, Salesforce.com, Inc.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice,
 * this list of conditions and the following disclaimer.
 *
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 * this list of conditions and the following disclaimer in the documentation
 * and/or other materials provided with the distribution.
 *
 * 3. Neither the name of Salesforce.com nor the names of its contributors may
 * be used to endorse or promote products derived from this software without
 * specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 */

// Gives the permutation of all possible domainMatch()es of a given domain. The
// array is in shortest-to-longest order.  Handy for indexing.
function permuteDomain(domain) {
  var pubSuf = pubsuffixPsl.getPublicSuffix(domain);
  if (!pubSuf) {
    return null;
  }
  if (pubSuf == domain) {
    return [domain];
  }

  var prefix = domain.slice(0, -(pubSuf.length + 1)); // ".example.com"
  var parts = prefix.split('.').reverse();
  var cur = pubSuf;
  var permutations = [cur];
  while (parts.length) {
    cur = parts.shift() + '.' + cur;
    permutations.push(cur);
  }
  return permutations;
}

var permuteDomain_2 = permuteDomain;

var permuteDomain_1 = {
  permuteDomain: permuteDomain_2
};

/*!
 * Copyright (c) 2015, Salesforce.com, Inc.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice,
 * this list of conditions and the following disclaimer.
 *
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 * this list of conditions and the following disclaimer in the documentation
 * and/or other materials provided with the distribution.
 *
 * 3. Neither the name of Salesforce.com nor the names of its contributors may
 * be used to endorse or promote products derived from this software without
 * specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 */
/*
 * "A request-path path-matches a given cookie-path if at least one of the
 * following conditions holds:"
 */
function pathMatch(reqPath, cookiePath) {
  // "o  The cookie-path and the request-path are identical."
  if (cookiePath === reqPath) {
    return true;
  }

  var idx = reqPath.indexOf(cookiePath);
  if (idx === 0) {
    // "o  The cookie-path is a prefix of the request-path, and the last
    // character of the cookie-path is %x2F ("/")."
    if (cookiePath.substr(-1) === '/') {
      return true;
    }

    // " o  The cookie-path is a prefix of the request-path, and the first
    // character of the request-path that is not included in the cookie- path
    // is a %x2F ("/") character."
    if (reqPath.substr(cookiePath.length, 1) === '/') {
      return true;
    }
  }

  return false;
}

var pathMatch_2 = pathMatch;

var pathMatch_1 = {
  pathMatch: pathMatch_2
};

/*!
 * Copyright (c) 2015, Salesforce.com, Inc.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice,
 * this list of conditions and the following disclaimer.
 *
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 * this list of conditions and the following disclaimer in the documentation
 * and/or other materials provided with the distribution.
 *
 * 3. Neither the name of Salesforce.com nor the names of its contributors may
 * be used to endorse or promote products derived from this software without
 * specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 */
var Store$1 = store.Store;
var permuteDomain$1 = permuteDomain_1.permuteDomain;
var pathMatch$1 = pathMatch_1.pathMatch;

function MemoryCookieStore() {
  Store$1.call(this);
  this.idx = {};
}
util__default['default'].inherits(MemoryCookieStore, Store$1);
var MemoryCookieStore_1 = MemoryCookieStore;
MemoryCookieStore.prototype.idx = null;

// Since it's just a struct in RAM, this Store is synchronous
MemoryCookieStore.prototype.synchronous = true;

// force a default depth:
MemoryCookieStore.prototype.inspect = function() {
  return '{ idx: ' + util__default['default'].inspect(this.idx, false, 2) + ' }';
};

// Use the new custom inspection symbol to add the custom inspect function if
// available.
if (util__default['default'].inspect.custom) {
  MemoryCookieStore.prototype[util__default['default'].inspect.custom] = MemoryCookieStore.prototype.inspect;
}

MemoryCookieStore.prototype.findCookie = function(domain, path, key, cb) {
  if (!this.idx[domain]) {
    return cb(null, undefined);
  }
  if (!this.idx[domain][path]) {
    return cb(null, undefined);
  }
  return cb(null, this.idx[domain][path][key] || null);
};

MemoryCookieStore.prototype.findCookies = function(domain, path, cb) {
  var results = [];
  if (!domain) {
    return cb(null, []);
  }

  var pathMatcher;
  if (!path) {
    // null means "all paths"
    pathMatcher = function matchAll(domainIndex) {
      for (var curPath in domainIndex) {
        var pathIndex = domainIndex[curPath];
        for (var key in pathIndex) {
          results.push(pathIndex[key]);
        }
      }
    };
  } else {
    pathMatcher = function matchRFC(domainIndex) {
      //NOTE: we should use path-match algorithm from S5.1.4 here
      //(see : https://github.com/ChromiumWebApps/chromium/blob/b3d3b4da8bb94c1b2e061600df106d590fda3620/net/cookies/canonical_cookie.cc#L299)
      Object.keys(domainIndex).forEach(function(cookiePath) {
        if (pathMatch$1(path, cookiePath)) {
          var pathIndex = domainIndex[cookiePath];

          for (var key in pathIndex) {
            results.push(pathIndex[key]);
          }
        }
      });
    };
  }

  var domains = permuteDomain$1(domain) || [domain];
  var idx = this.idx;
  domains.forEach(function(curDomain) {
    var domainIndex = idx[curDomain];
    if (!domainIndex) {
      return;
    }
    pathMatcher(domainIndex);
  });

  cb(null, results);
};

MemoryCookieStore.prototype.putCookie = function(cookie, cb) {
  if (!this.idx[cookie.domain]) {
    this.idx[cookie.domain] = {};
  }
  if (!this.idx[cookie.domain][cookie.path]) {
    this.idx[cookie.domain][cookie.path] = {};
  }
  this.idx[cookie.domain][cookie.path][cookie.key] = cookie;
  cb(null);
};

MemoryCookieStore.prototype.updateCookie = function(oldCookie, newCookie, cb) {
  // updateCookie() may avoid updating cookies that are identical.  For example,
  // lastAccessed may not be important to some stores and an equality
  // comparison could exclude that field.
  this.putCookie(newCookie, cb);
};

MemoryCookieStore.prototype.removeCookie = function(domain, path, key, cb) {
  if (this.idx[domain] && this.idx[domain][path] && this.idx[domain][path][key]) {
    delete this.idx[domain][path][key];
  }
  cb(null);
};

MemoryCookieStore.prototype.removeCookies = function(domain, path, cb) {
  if (this.idx[domain]) {
    if (path) {
      delete this.idx[domain][path];
    } else {
      delete this.idx[domain];
    }
  }
  return cb(null);
};

MemoryCookieStore.prototype.getAllCookies = function(cb) {
  var cookies = [];
  var idx = this.idx;

  var domains = Object.keys(idx);
  domains.forEach(function(domain) {
    var paths = Object.keys(idx[domain]);
    paths.forEach(function(path) {
      var keys = Object.keys(idx[domain][path]);
      keys.forEach(function(key) {
        if (key !== null) {
          cookies.push(idx[domain][path][key]);
        }
      });
    });
  });

  // Sort by creationIndex so deserializing retains the creation order.
  // When implementing your own store, this SHOULD retain the order too
  cookies.sort(function(a, b) {
    return (a.creationIndex || 0) - (b.creationIndex || 0);
  });

  cb(null, cookies);
};

var memstore = {
  MemoryCookieStore: MemoryCookieStore_1
};

var author = {
  name: 'Jeremy Stashewsky',
  email: 'jstash@gmail.com',
  website: 'https://github.com/stash'
};
var contributors = [
  {
    name: 'Alexander Savin',
    website: 'https://github.com/apsavin'
  },
  {
    name: 'Ian Livingstone',
    website: 'https://github.com/ianlivingstone'
  },
  {
    name: 'Ivan Nikulin',
    website: 'https://github.com/inikulin'
  },
  {
    name: 'Lalit Kapoor',
    website: 'https://github.com/lalitkapoor'
  },
  {
    name: 'Sam Thompson',
    website: 'https://github.com/sambthompson'
  },
  {
    name: 'Sebastian Mayr',
    website: 'https://github.com/Sebmaster'
  }
];
var license = 'BSD-3-Clause';
var name = 'tough-cookie';
var description = 'RFC6265 Cookies and Cookie Jar for node.js';
var keywords = ['HTTP', 'cookie', 'cookies', 'set-cookie', 'cookiejar', 'jar', 'RFC6265', 'RFC2965'];
var version = '2.4.3';
var homepage = 'https://github.com/salesforce/tough-cookie';
var repository = {
  type: 'git',
  url: 'git://github.com/salesforce/tough-cookie.git'
};
var bugs = {
  url: 'https://github.com/salesforce/tough-cookie/issues'
};
var main = './lib/cookie';
var files = ['lib'];
var scripts = {
  test: 'vows test/*_test.js',
  cover: 'nyc --reporter=lcov --reporter=html vows test/*_test.js'
};
var engines = {
  node: '>=0.8'
};
var devDependencies = {
  async: '^1.4.2',
  nyc: '^11.6.0',
  'string.prototype.repeat': '^0.2.0',
  vows: '^0.8.1'
};
var dependencies = {
  psl: '^1.1.24',
  punycode: '^1.4.1'
};
var require$$4 = {
  author: author,
  contributors: contributors,
  license: license,
  name: name,
  description: description,
  keywords: keywords,
  version: version,
  homepage: homepage,
  repository: repository,
  bugs: bugs,
  main: main,
  files: files,
  scripts: scripts,
  engines: engines,
  devDependencies: devDependencies,
  dependencies: dependencies
};

/*!
 * Copyright (c) 2015, Salesforce.com, Inc.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice,
 * this list of conditions and the following disclaimer.
 *
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 * this list of conditions and the following disclaimer in the documentation
 * and/or other materials provided with the distribution.
 *
 * 3. Neither the name of Salesforce.com nor the names of its contributors may
 * be used to endorse or promote products derived from this software without
 * specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 */

var urlParse = url__default['default'].parse;

var Store$2 = store.Store;
var MemoryCookieStore$1 = memstore.MemoryCookieStore;
var pathMatch$2 = pathMatch_1.pathMatch;
var VERSION = require$$4.version;

var punycode;
try {
  punycode = Punycode__default['default'];
} catch (e) {
  console.warn("tough-cookie: can't load punycode; won't use punycode for domain normalization");
}

// From RFC6265 S4.1.1
// note that it excludes \x3B ";"
var COOKIE_OCTETS = /^[\x21\x23-\x2B\x2D-\x3A\x3C-\x5B\x5D-\x7E]+$/;

var CONTROL_CHARS = /[\x00-\x1F]/;

// From Chromium // '\r', '\n' and '\0' should be treated as a terminator in
// the "relaxed" mode, see:
// https://github.com/ChromiumWebApps/chromium/blob/b3d3b4da8bb94c1b2e061600df106d590fda3620/net/cookies/parsed_cookie.cc#L60
var TERMINATORS = ['\n', '\r', '\0'];

// RFC6265 S4.1.1 defines path value as 'any CHAR except CTLs or ";"'
// Note ';' is \x3B
var PATH_VALUE = /[\x20-\x3A\x3C-\x7E]+/;

// date-time parsing constants (RFC6265 S5.1.1)

var DATE_DELIM = /[\x09\x20-\x2F\x3B-\x40\x5B-\x60\x7B-\x7E]/;

var MONTH_TO_NUM = {
  jan: 0,
  feb: 1,
  mar: 2,
  apr: 3,
  may: 4,
  jun: 5,
  jul: 6,
  aug: 7,
  sep: 8,
  oct: 9,
  nov: 10,
  dec: 11
};
var NUM_TO_MONTH = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
var NUM_TO_DAY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

var MAX_TIME = 2147483647000; // 31-bit max
var MIN_TIME = 0; // 31-bit min

/*
 * Parses a Natural number (i.e., non-negative integer) with either the
 *    <min>*<max>DIGIT ( non-digit *OCTET )
 * or
 *    <min>*<max>DIGIT
 * grammar (RFC6265 S5.1.1).
 *
 * The "trailingOK" boolean controls if the grammar accepts a
 * "( non-digit *OCTET )" trailer.
 */
function parseDigits(token, minDigits, maxDigits, trailingOK) {
  var count = 0;
  while (count < token.length) {
    var c = token.charCodeAt(count);
    // "non-digit = %x00-2F / %x3A-FF"
    if (c <= 0x2f || c >= 0x3a) {
      break;
    }
    count++;
  }

  // constrain to a minimum and maximum number of digits.
  if (count < minDigits || count > maxDigits) {
    return null;
  }

  if (!trailingOK && count != token.length) {
    return null;
  }

  return parseInt(token.substr(0, count), 10);
}

function parseTime(token) {
  var parts = token.split(':');
  var result = [0, 0, 0];

  /* RF6256 S5.1.1:
   *      time            = hms-time ( non-digit *OCTET )
   *      hms-time        = time-field ":" time-field ":" time-field
   *      time-field      = 1*2DIGIT
   */

  if (parts.length !== 3) {
    return null;
  }

  for (var i = 0; i < 3; i++) {
    // "time-field" must be strictly "1*2DIGIT", HOWEVER, "hms-time" can be
    // followed by "( non-digit *OCTET )" so therefore the last time-field can
    // have a trailer
    var trailingOK = i == 2;
    var num = parseDigits(parts[i], 1, 2, trailingOK);
    if (num === null) {
      return null;
    }
    result[i] = num;
  }

  return result;
}

function parseMonth(token) {
  token = String(token)
    .substr(0, 3)
    .toLowerCase();
  var num = MONTH_TO_NUM[token];
  return num >= 0 ? num : null;
}

/*
 * RFC6265 S5.1.1 date parser (see RFC for full grammar)
 */
function parseDate(str) {
  if (!str) {
    return;
  }

  /* RFC6265 S5.1.1:
   * 2. Process each date-token sequentially in the order the date-tokens
   * appear in the cookie-date
   */
  var tokens = str.split(DATE_DELIM);
  if (!tokens) {
    return;
  }

  var hour = null;
  var minute = null;
  var second = null;
  var dayOfMonth = null;
  var month = null;
  var year = null;

  for (var i = 0; i < tokens.length; i++) {
    var token = tokens[i].trim();
    if (!token.length) {
      continue;
    }

    var result;

    /* 2.1. If the found-time flag is not set and the token matches the time
     * production, set the found-time flag and set the hour- value,
     * minute-value, and second-value to the numbers denoted by the digits in
     * the date-token, respectively.  Skip the remaining sub-steps and continue
     * to the next date-token.
     */
    if (second === null) {
      result = parseTime(token);
      if (result) {
        hour = result[0];
        minute = result[1];
        second = result[2];
        continue;
      }
    }

    /* 2.2. If the found-day-of-month flag is not set and the date-token matches
     * the day-of-month production, set the found-day-of- month flag and set
     * the day-of-month-value to the number denoted by the date-token.  Skip
     * the remaining sub-steps and continue to the next date-token.
     */
    if (dayOfMonth === null) {
      // "day-of-month = 1*2DIGIT ( non-digit *OCTET )"
      result = parseDigits(token, 1, 2, true);
      if (result !== null) {
        dayOfMonth = result;
        continue;
      }
    }

    /* 2.3. If the found-month flag is not set and the date-token matches the
     * month production, set the found-month flag and set the month-value to
     * the month denoted by the date-token.  Skip the remaining sub-steps and
     * continue to the next date-token.
     */
    if (month === null) {
      result = parseMonth(token);
      if (result !== null) {
        month = result;
        continue;
      }
    }

    /* 2.4. If the found-year flag is not set and the date-token matches the
     * year production, set the found-year flag and set the year-value to the
     * number denoted by the date-token.  Skip the remaining sub-steps and
     * continue to the next date-token.
     */
    if (year === null) {
      // "year = 2*4DIGIT ( non-digit *OCTET )"
      result = parseDigits(token, 2, 4, true);
      if (result !== null) {
        year = result;
        /* From S5.1.1:
         * 3.  If the year-value is greater than or equal to 70 and less
         * than or equal to 99, increment the year-value by 1900.
         * 4.  If the year-value is greater than or equal to 0 and less
         * than or equal to 69, increment the year-value by 2000.
         */
        if (year >= 70 && year <= 99) {
          year += 1900;
        } else if (year >= 0 && year <= 69) {
          year += 2000;
        }
      }
    }
  }

  /* RFC 6265 S5.1.1
   * "5. Abort these steps and fail to parse the cookie-date if:
   *     *  at least one of the found-day-of-month, found-month, found-
   *        year, or found-time flags is not set,
   *     *  the day-of-month-value is less than 1 or greater than 31,
   *     *  the year-value is less than 1601,
   *     *  the hour-value is greater than 23,
   *     *  the minute-value is greater than 59, or
   *     *  the second-value is greater than 59.
   *     (Note that leap seconds cannot be represented in this syntax.)"
   *
   * So, in order as above:
   */
  if (
    dayOfMonth === null ||
    month === null ||
    year === null ||
    second === null ||
    dayOfMonth < 1 ||
    dayOfMonth > 31 ||
    year < 1601 ||
    hour > 23 ||
    minute > 59 ||
    second > 59
  ) {
    return;
  }

  return new Date(Date.UTC(year, month, dayOfMonth, hour, minute, second));
}

function formatDate(date) {
  var d = date.getUTCDate();
  d = d >= 10 ? d : '0' + d;
  var h = date.getUTCHours();
  h = h >= 10 ? h : '0' + h;
  var m = date.getUTCMinutes();
  m = m >= 10 ? m : '0' + m;
  var s = date.getUTCSeconds();
  s = s >= 10 ? s : '0' + s;
  return (
    NUM_TO_DAY[date.getUTCDay()] +
    ', ' +
    d +
    ' ' +
    NUM_TO_MONTH[date.getUTCMonth()] +
    ' ' +
    date.getUTCFullYear() +
    ' ' +
    h +
    ':' +
    m +
    ':' +
    s +
    ' GMT'
  );
}

// S5.1.2 Canonicalized Host Names
function canonicalDomain(str) {
  if (str == null) {
    return null;
  }
  str = str.trim().replace(/^\./, ''); // S4.1.2.3 & S5.2.3: ignore leading .

  // convert to IDN if any non-ASCII characters
  if (punycode && /[^\u0001-\u007f]/.test(str)) {
    str = punycode.toASCII(str);
  }

  return str.toLowerCase();
}

// S5.1.3 Domain Matching
function domainMatch(str, domStr, canonicalize) {
  if (str == null || domStr == null) {
    return null;
  }
  if (canonicalize !== false) {
    str = canonicalDomain(str);
    domStr = canonicalDomain(domStr);
  }

  /*
   * "The domain string and the string are identical. (Note that both the
   * domain string and the string will have been canonicalized to lower case at
   * this point)"
   */
  if (str == domStr) {
    return true;
  }

  /* "All of the following [three] conditions hold:" (order adjusted from the RFC) */

  /* "* The string is a host name (i.e., not an IP address)." */
  if (net__default['default'].isIP(str)) {
    return false;
  }

  /* "* The domain string is a suffix of the string" */
  var idx = str.indexOf(domStr);
  if (idx <= 0) {
    return false; // it's a non-match (-1) or prefix (0)
  }

  // e.g "a.b.c".indexOf("b.c") === 2
  // 5 === 3+2
  if (str.length !== domStr.length + idx) {
    // it's not a suffix
    return false;
  }

  /* "* The last character of the string that is not included in the domain
   * string is a %x2E (".") character." */
  if (str.substr(idx - 1, 1) !== '.') {
    return false;
  }

  return true;
}

// RFC6265 S5.1.4 Paths and Path-Match

/*
 * "The user agent MUST use an algorithm equivalent to the following algorithm
 * to compute the default-path of a cookie:"
 *
 * Assumption: the path (and not query part or absolute uri) is passed in.
 */
function defaultPath(path) {
  // "2. If the uri-path is empty or if the first character of the uri-path is not
  // a %x2F ("/") character, output %x2F ("/") and skip the remaining steps.
  if (!path || path.substr(0, 1) !== '/') {
    return '/';
  }

  // "3. If the uri-path contains no more than one %x2F ("/") character, output
  // %x2F ("/") and skip the remaining step."
  if (path === '/') {
    return path;
  }

  var rightSlash = path.lastIndexOf('/');
  if (rightSlash === 0) {
    return '/';
  }

  // "4. Output the characters of the uri-path from the first character up to,
  // but not including, the right-most %x2F ("/")."
  return path.slice(0, rightSlash);
}

function trimTerminator(str) {
  for (var t = 0; t < TERMINATORS.length; t++) {
    var terminatorIdx = str.indexOf(TERMINATORS[t]);
    if (terminatorIdx !== -1) {
      str = str.substr(0, terminatorIdx);
    }
  }

  return str;
}

function parseCookiePair(cookiePair, looseMode) {
  cookiePair = trimTerminator(cookiePair);

  var firstEq = cookiePair.indexOf('=');
  if (looseMode) {
    if (firstEq === 0) {
      // '=' is immediately at start
      cookiePair = cookiePair.substr(1);
      firstEq = cookiePair.indexOf('='); // might still need to split on '='
    }
  } else {
    // non-loose mode
    if (firstEq <= 0) {
      // no '=' or is at start
      return; // needs to have non-empty "cookie-name"
    }
  }

  var cookieName, cookieValue;
  if (firstEq <= 0) {
    cookieName = '';
    cookieValue = cookiePair.trim();
  } else {
    cookieName = cookiePair.substr(0, firstEq).trim();
    cookieValue = cookiePair.substr(firstEq + 1).trim();
  }

  if (CONTROL_CHARS.test(cookieName) || CONTROL_CHARS.test(cookieValue)) {
    return;
  }

  var c = new Cookie();
  c.key = cookieName;
  c.value = cookieValue;
  return c;
}

function parse(str, options) {
  if (!options || typeof options !== 'object') {
    options = {};
  }
  str = str.trim();

  // We use a regex to parse the "name-value-pair" part of S5.2
  var firstSemi = str.indexOf(';'); // S5.2 step 1
  var cookiePair = firstSemi === -1 ? str : str.substr(0, firstSemi);
  var c = parseCookiePair(cookiePair, !!options.loose);
  if (!c) {
    return;
  }

  if (firstSemi === -1) {
    return c;
  }

  // S5.2.3 "unparsed-attributes consist of the remainder of the set-cookie-string
  // (including the %x3B (";") in question)." plus later on in the same section
  // "discard the first ";" and trim".
  var unparsed = str.slice(firstSemi + 1).trim();

  // "If the unparsed-attributes string is empty, skip the rest of these
  // steps."
  if (unparsed.length === 0) {
    return c;
  }

  /*
   * S5.2 says that when looping over the items "[p]rocess the attribute-name
   * and attribute-value according to the requirements in the following
   * subsections" for every item.  Plus, for many of the individual attributes
   * in S5.3 it says to use the "attribute-value of the last attribute in the
   * cookie-attribute-list".  Therefore, in this implementation, we overwrite
   * the previous value.
   */
  var cookie_avs = unparsed.split(';');
  while (cookie_avs.length) {
    var av = cookie_avs.shift().trim();
    if (av.length === 0) {
      // happens if ";;" appears
      continue;
    }
    var av_sep = av.indexOf('=');
    var av_key, av_value;

    if (av_sep === -1) {
      av_key = av;
      av_value = null;
    } else {
      av_key = av.substr(0, av_sep);
      av_value = av.substr(av_sep + 1);
    }

    av_key = av_key.trim().toLowerCase();

    if (av_value) {
      av_value = av_value.trim();
    }

    switch (av_key) {
      case 'expires': // S5.2.1
        if (av_value) {
          var exp = parseDate(av_value);
          // "If the attribute-value failed to parse as a cookie date, ignore the
          // cookie-av."
          if (exp) {
            // over and underflow not realistically a concern: V8's getTime() seems to
            // store something larger than a 32-bit time_t (even with 32-bit node)
            c.expires = exp;
          }
        }
        break;

      case 'max-age': // S5.2.2
        if (av_value) {
          // "If the first character of the attribute-value is not a DIGIT or a "-"
          // character ...[or]... If the remainder of attribute-value contains a
          // non-DIGIT character, ignore the cookie-av."
          if (/^-?[0-9]+$/.test(av_value)) {
            var delta = parseInt(av_value, 10);
            // "If delta-seconds is less than or equal to zero (0), let expiry-time
            // be the earliest representable date and time."
            c.setMaxAge(delta);
          }
        }
        break;

      case 'domain': // S5.2.3
        // "If the attribute-value is empty, the behavior is undefined.  However,
        // the user agent SHOULD ignore the cookie-av entirely."
        if (av_value) {
          // S5.2.3 "Let cookie-domain be the attribute-value without the leading %x2E
          // (".") character."
          var domain = av_value.trim().replace(/^\./, '');
          if (domain) {
            // "Convert the cookie-domain to lower case."
            c.domain = domain.toLowerCase();
          }
        }
        break;

      case 'path': // S5.2.4
        /*
         * "If the attribute-value is empty or if the first character of the
         * attribute-value is not %x2F ("/"):
         *   Let cookie-path be the default-path.
         * Otherwise:
         *   Let cookie-path be the attribute-value."
         *
         * We'll represent the default-path as null since it depends on the
         * context of the parsing.
         */
        c.path = av_value && av_value[0] === '/' ? av_value : null;
        break;

      case 'secure': // S5.2.5
        /*
         * "If the attribute-name case-insensitively matches the string "Secure",
         * the user agent MUST append an attribute to the cookie-attribute-list
         * with an attribute-name of Secure and an empty attribute-value."
         */
        c.secure = true;
        break;

      case 'httponly': // S5.2.6 -- effectively the same as 'secure'
        c.httpOnly = true;
        break;

      default:
        c.extensions = c.extensions || [];
        c.extensions.push(av);
        break;
    }
  }

  return c;
}

// avoid the V8 deoptimization monster!
function jsonParse(str) {
  var obj;
  try {
    obj = JSON.parse(str);
  } catch (e) {
    return e;
  }
  return obj;
}

function fromJSON(str) {
  if (!str) {
    return null;
  }

  var obj;
  if (typeof str === 'string') {
    obj = jsonParse(str);
    if (obj instanceof Error) {
      return null;
    }
  } else {
    // assume it's an Object
    obj = str;
  }

  var c = new Cookie();
  for (var i = 0; i < Cookie.serializableProperties.length; i++) {
    var prop = Cookie.serializableProperties[i];
    if (obj[prop] === undefined || obj[prop] === Cookie.prototype[prop]) {
      continue; // leave as prototype default
    }

    if (prop === 'expires' || prop === 'creation' || prop === 'lastAccessed') {
      if (obj[prop] === null) {
        c[prop] = null;
      } else {
        c[prop] = obj[prop] == 'Infinity' ? 'Infinity' : new Date(obj[prop]);
      }
    } else {
      c[prop] = obj[prop];
    }
  }

  return c;
}

/* Section 5.4 part 2:
 * "*  Cookies with longer paths are listed before cookies with
 *     shorter paths.
 *
 *  *  Among cookies that have equal-length path fields, cookies with
 *     earlier creation-times are listed before cookies with later
 *     creation-times."
 */

function cookieCompare(a, b) {
  var cmp = 0;

  // descending for length: b CMP a
  var aPathLen = a.path ? a.path.length : 0;
  var bPathLen = b.path ? b.path.length : 0;
  cmp = bPathLen - aPathLen;
  if (cmp !== 0) {
    return cmp;
  }

  // ascending for time: a CMP b
  var aTime = a.creation ? a.creation.getTime() : MAX_TIME;
  var bTime = b.creation ? b.creation.getTime() : MAX_TIME;
  cmp = aTime - bTime;
  if (cmp !== 0) {
    return cmp;
  }

  // break ties for the same millisecond (precision of JavaScript's clock)
  cmp = a.creationIndex - b.creationIndex;

  return cmp;
}

// Gives the permutation of all possible pathMatch()es of a given path. The
// array is in longest-to-shortest order.  Handy for indexing.
function permutePath(path) {
  if (path === '/') {
    return ['/'];
  }
  if (path.lastIndexOf('/') === path.length - 1) {
    path = path.substr(0, path.length - 1);
  }
  var permutations = [path];
  while (path.length > 1) {
    var lindex = path.lastIndexOf('/');
    if (lindex === 0) {
      break;
    }
    path = path.substr(0, lindex);
    permutations.push(path);
  }
  permutations.push('/');
  return permutations;
}

function getCookieContext(url) {
  if (url instanceof Object) {
    return url;
  }
  // NOTE: decodeURI will throw on malformed URIs (see GH-32).
  // Therefore, we will just skip decoding for such URIs.
  try {
    url = decodeURI(url);
  } catch (err) {
    // Silently swallow error
  }

  return urlParse(url);
}

function Cookie(options) {
  options = options || {};

  Object.keys(options).forEach(function(prop) {
    if (
      Cookie.prototype.hasOwnProperty(prop) &&
      Cookie.prototype[prop] !== options[prop] &&
      prop.substr(0, 1) !== '_'
    ) {
      this[prop] = options[prop];
    }
  }, this);

  this.creation = this.creation || new Date();

  // used to break creation ties in cookieCompare():
  Object.defineProperty(this, 'creationIndex', {
    configurable: false,
    enumerable: false, // important for assert.deepEqual checks
    writable: true,
    value: ++Cookie.cookiesCreated
  });
}

Cookie.cookiesCreated = 0; // incremented each time a cookie is created

Cookie.parse = parse;
Cookie.fromJSON = fromJSON;

Cookie.prototype.key = '';
Cookie.prototype.value = '';

// the order in which the RFC has them:
Cookie.prototype.expires = 'Infinity'; // coerces to literal Infinity
Cookie.prototype.maxAge = null; // takes precedence over expires for TTL
Cookie.prototype.domain = null;
Cookie.prototype.path = null;
Cookie.prototype.secure = false;
Cookie.prototype.httpOnly = false;
Cookie.prototype.extensions = null;

// set by the CookieJar:
Cookie.prototype.hostOnly = null; // boolean when set
Cookie.prototype.pathIsDefault = null; // boolean when set
Cookie.prototype.creation = null; // Date when set; defaulted by Cookie.parse
Cookie.prototype.lastAccessed = null; // Date when set
Object.defineProperty(Cookie.prototype, 'creationIndex', {
  configurable: true,
  enumerable: false,
  writable: true,
  value: 0
});

Cookie.serializableProperties = Object.keys(Cookie.prototype).filter(function(prop) {
  return !(Cookie.prototype[prop] instanceof Function || prop === 'creationIndex' || prop.substr(0, 1) === '_');
});

Cookie.prototype.inspect = function inspect() {
  var now = Date.now();
  return (
    'Cookie="' +
    this.toString() +
    '; hostOnly=' +
    (this.hostOnly != null ? this.hostOnly : '?') +
    '; aAge=' +
    (this.lastAccessed ? now - this.lastAccessed.getTime() + 'ms' : '?') +
    '; cAge=' +
    (this.creation ? now - this.creation.getTime() + 'ms' : '?') +
    '"'
  );
};

// Use the new custom inspection symbol to add the custom inspect function if
// available.
if (util__default['default'].inspect.custom) {
  Cookie.prototype[util__default['default'].inspect.custom] = Cookie.prototype.inspect;
}

Cookie.prototype.toJSON = function() {
  var obj = {};

  var props = Cookie.serializableProperties;
  for (var i = 0; i < props.length; i++) {
    var prop = props[i];
    if (this[prop] === Cookie.prototype[prop]) {
      continue; // leave as prototype default
    }

    if (prop === 'expires' || prop === 'creation' || prop === 'lastAccessed') {
      if (this[prop] === null) {
        obj[prop] = null;
      } else {
        obj[prop] =
          this[prop] == 'Infinity' // intentionally not ===
            ? 'Infinity'
            : this[prop].toISOString();
      }
    } else if (prop === 'maxAge') {
      if (this[prop] !== null) {
        // again, intentionally not ===
        obj[prop] = this[prop] == Infinity || this[prop] == -Infinity ? this[prop].toString() : this[prop];
      }
    } else {
      if (this[prop] !== Cookie.prototype[prop]) {
        obj[prop] = this[prop];
      }
    }
  }

  return obj;
};

Cookie.prototype.clone = function() {
  return fromJSON(this.toJSON());
};

Cookie.prototype.validate = function validate() {
  if (!COOKIE_OCTETS.test(this.value)) {
    return false;
  }
  if (this.expires != Infinity && !(this.expires instanceof Date) && !parseDate(this.expires)) {
    return false;
  }
  if (this.maxAge != null && this.maxAge <= 0) {
    return false; // "Max-Age=" non-zero-digit *DIGIT
  }
  if (this.path != null && !PATH_VALUE.test(this.path)) {
    return false;
  }

  var cdomain = this.cdomain();
  if (cdomain) {
    if (cdomain.match(/\.$/)) {
      return false; // S4.1.2.3 suggests that this is bad. domainMatch() tests confirm this
    }
    var suffix = pubsuffixPsl.getPublicSuffix(cdomain);
    if (suffix == null) {
      // it's a public suffix
      return false;
    }
  }
  return true;
};

Cookie.prototype.setExpires = function setExpires(exp) {
  if (exp instanceof Date) {
    this.expires = exp;
  } else {
    this.expires = parseDate(exp) || 'Infinity';
  }
};

Cookie.prototype.setMaxAge = function setMaxAge(age) {
  if (age === Infinity || age === -Infinity) {
    this.maxAge = age.toString(); // so JSON.stringify() works
  } else {
    this.maxAge = age;
  }
};

// gives Cookie header format
Cookie.prototype.cookieString = function cookieString() {
  var val = this.value;
  if (val == null) {
    val = '';
  }
  if (this.key === '') {
    return val;
  }
  return this.key + '=' + val;
};

// gives Set-Cookie header format
Cookie.prototype.toString = function toString() {
  var str = this.cookieString();

  if (this.expires != Infinity) {
    if (this.expires instanceof Date) {
      str += '; Expires=' + formatDate(this.expires);
    } else {
      str += '; Expires=' + this.expires;
    }
  }

  if (this.maxAge != null && this.maxAge != Infinity) {
    str += '; Max-Age=' + this.maxAge;
  }

  if (this.domain && !this.hostOnly) {
    str += '; Domain=' + this.domain;
  }
  if (this.path) {
    str += '; Path=' + this.path;
  }

  if (this.secure) {
    str += '; Secure';
  }
  if (this.httpOnly) {
    str += '; HttpOnly';
  }
  if (this.extensions) {
    this.extensions.forEach(function(ext) {
      str += '; ' + ext;
    });
  }

  return str;
};

// TTL() partially replaces the "expiry-time" parts of S5.3 step 3 (setCookie()
// elsewhere)
// S5.3 says to give the "latest representable date" for which we use Infinity
// For "expired" we use 0
Cookie.prototype.TTL = function TTL(now) {
  /* RFC6265 S4.1.2.2 If a cookie has both the Max-Age and the Expires
   * attribute, the Max-Age attribute has precedence and controls the
   * expiration date of the cookie.
   * (Concurs with S5.3 step 3)
   */
  if (this.maxAge != null) {
    return this.maxAge <= 0 ? 0 : this.maxAge * 1000;
  }

  var expires = this.expires;
  if (expires != Infinity) {
    if (!(expires instanceof Date)) {
      expires = parseDate(expires) || Infinity;
    }

    if (expires == Infinity) {
      return Infinity;
    }

    return expires.getTime() - (now || Date.now());
  }

  return Infinity;
};

// expiryTime() replaces the "expiry-time" parts of S5.3 step 3 (setCookie()
// elsewhere)
Cookie.prototype.expiryTime = function expiryTime(now) {
  if (this.maxAge != null) {
    var relativeTo = now || this.creation || new Date();
    var age = this.maxAge <= 0 ? -Infinity : this.maxAge * 1000;
    return relativeTo.getTime() + age;
  }

  if (this.expires == Infinity) {
    return Infinity;
  }
  return this.expires.getTime();
};

// expiryDate() replaces the "expiry-time" parts of S5.3 step 3 (setCookie()
// elsewhere), except it returns a Date
Cookie.prototype.expiryDate = function expiryDate(now) {
  var millisec = this.expiryTime(now);
  if (millisec == Infinity) {
    return new Date(MAX_TIME);
  } else if (millisec == -Infinity) {
    return new Date(MIN_TIME);
  } else {
    return new Date(millisec);
  }
};

// This replaces the "persistent-flag" parts of S5.3 step 3
Cookie.prototype.isPersistent = function isPersistent() {
  return this.maxAge != null || this.expires != Infinity;
};

// Mostly S5.1.2 and S5.2.3:
Cookie.prototype.cdomain = Cookie.prototype.canonicalizedDomain = function canonicalizedDomain() {
  if (this.domain == null) {
    return null;
  }
  return canonicalDomain(this.domain);
};

function CookieJar(store, options) {
  if (typeof options === 'boolean') {
    options = { rejectPublicSuffixes: options };
  } else if (options == null) {
    options = {};
  }
  if (options.rejectPublicSuffixes != null) {
    this.rejectPublicSuffixes = options.rejectPublicSuffixes;
  }
  if (options.looseMode != null) {
    this.enableLooseMode = options.looseMode;
  }

  if (!store) {
    store = new MemoryCookieStore$1();
  }
  this.store = store;
}
CookieJar.prototype.store = null;
CookieJar.prototype.rejectPublicSuffixes = true;
CookieJar.prototype.enableLooseMode = false;
var CAN_BE_SYNC = [];

CAN_BE_SYNC.push('setCookie');
CookieJar.prototype.setCookie = function(cookie, url, options, cb) {
  var err;
  var context = getCookieContext(url);
  if (options instanceof Function) {
    cb = options;
    options = {};
  }

  var host = canonicalDomain(context.hostname);
  var loose = this.enableLooseMode;
  if (options.loose != null) {
    loose = options.loose;
  }

  // S5.3 step 1
  if (!(cookie instanceof Cookie)) {
    cookie = Cookie.parse(cookie, { loose: loose });
  }
  if (!cookie) {
    err = new Error('Cookie failed to parse');
    return cb(options.ignoreError ? null : err);
  }

  // S5.3 step 2
  var now = options.now || new Date(); // will assign later to save effort in the face of errors

  // S5.3 step 3: NOOP; persistent-flag and expiry-time is handled by getCookie()

  // S5.3 step 4: NOOP; domain is null by default

  // S5.3 step 5: public suffixes
  if (this.rejectPublicSuffixes && cookie.domain) {
    var suffix = pubsuffixPsl.getPublicSuffix(cookie.cdomain());
    if (suffix == null) {
      // e.g. "com"
      err = new Error('Cookie has domain set to a public suffix');
      return cb(options.ignoreError ? null : err);
    }
  }

  // S5.3 step 6:
  if (cookie.domain) {
    if (!domainMatch(host, cookie.cdomain(), false)) {
      err = new Error("Cookie not in this host's domain. Cookie:" + cookie.cdomain() + ' Request:' + host);
      return cb(options.ignoreError ? null : err);
    }

    if (cookie.hostOnly == null) {
      // don't reset if already set
      cookie.hostOnly = false;
    }
  } else {
    cookie.hostOnly = true;
    cookie.domain = host;
  }

  //S5.2.4 If the attribute-value is empty or if the first character of the
  //attribute-value is not %x2F ("/"):
  //Let cookie-path be the default-path.
  if (!cookie.path || cookie.path[0] !== '/') {
    cookie.path = defaultPath(context.pathname);
    cookie.pathIsDefault = true;
  }

  // S5.3 step 8: NOOP; secure attribute
  // S5.3 step 9: NOOP; httpOnly attribute

  // S5.3 step 10
  if (options.http === false && cookie.httpOnly) {
    err = new Error("Cookie is HttpOnly and this isn't an HTTP API");
    return cb(options.ignoreError ? null : err);
  }

  var store = this.store;

  if (!store.updateCookie) {
    store.updateCookie = function(oldCookie, newCookie, cb) {
      this.putCookie(newCookie, cb);
    };
  }

  function withCookie(err, oldCookie) {
    if (err) {
      return cb(err);
    }

    var next = function(err) {
      if (err) {
        return cb(err);
      } else {
        cb(null, cookie);
      }
    };

    if (oldCookie) {
      // S5.3 step 11 - "If the cookie store contains a cookie with the same name,
      // domain, and path as the newly created cookie:"
      if (options.http === false && oldCookie.httpOnly) {
        // step 11.2
        err = new Error("old Cookie is HttpOnly and this isn't an HTTP API");
        return cb(options.ignoreError ? null : err);
      }
      cookie.creation = oldCookie.creation; // step 11.3
      cookie.creationIndex = oldCookie.creationIndex; // preserve tie-breaker
      cookie.lastAccessed = now;
      // Step 11.4 (delete cookie) is implied by just setting the new one:
      store.updateCookie(oldCookie, cookie, next); // step 12
    } else {
      cookie.creation = cookie.lastAccessed = now;
      store.putCookie(cookie, next); // step 12
    }
  }

  store.findCookie(cookie.domain, cookie.path, cookie.key, withCookie);
};

// RFC6365 S5.4
CAN_BE_SYNC.push('getCookies');
CookieJar.prototype.getCookies = function(url, options, cb) {
  var context = getCookieContext(url);
  if (options instanceof Function) {
    cb = options;
    options = {};
  }

  var host = canonicalDomain(context.hostname);
  var path = context.pathname || '/';

  var secure = options.secure;
  if (secure == null && context.protocol && (context.protocol == 'https:' || context.protocol == 'wss:')) {
    secure = true;
  }

  var http = options.http;
  if (http == null) {
    http = true;
  }

  var now = options.now || Date.now();
  var expireCheck = options.expire !== false;
  var allPaths = !!options.allPaths;
  var store = this.store;

  function matchingCookie(c) {
    // "Either:
    //   The cookie's host-only-flag is true and the canonicalized
    //   request-host is identical to the cookie's domain.
    // Or:
    //   The cookie's host-only-flag is false and the canonicalized
    //   request-host domain-matches the cookie's domain."
    if (c.hostOnly) {
      if (c.domain != host) {
        return false;
      }
    } else {
      if (!domainMatch(host, c.domain, false)) {
        return false;
      }
    }

    // "The request-uri's path path-matches the cookie's path."
    if (!allPaths && !pathMatch$2(path, c.path)) {
      return false;
    }

    // "If the cookie's secure-only-flag is true, then the request-uri's
    // scheme must denote a "secure" protocol"
    if (c.secure && !secure) {
      return false;
    }

    // "If the cookie's http-only-flag is true, then exclude the cookie if the
    // cookie-string is being generated for a "non-HTTP" API"
    if (c.httpOnly && !http) {
      return false;
    }

    // deferred from S5.3
    // non-RFC: allow retention of expired cookies by choice
    if (expireCheck && c.expiryTime() <= now) {
      store.removeCookie(c.domain, c.path, c.key, function() {}); // result ignored
      return false;
    }

    return true;
  }

  store.findCookies(host, allPaths ? null : path, function(err, cookies) {
    if (err) {
      return cb(err);
    }

    cookies = cookies.filter(matchingCookie);

    // sorting of S5.4 part 2
    if (options.sort !== false) {
      cookies = cookies.sort(cookieCompare);
    }

    // S5.4 part 3
    var now = new Date();
    cookies.forEach(function(c) {
      c.lastAccessed = now;
    });
    // TODO persist lastAccessed

    cb(null, cookies);
  });
};

CAN_BE_SYNC.push('getCookieString');
CookieJar.prototype.getCookieString = function(/*..., cb*/) {
  var args = Array.prototype.slice.call(arguments, 0);
  var cb = args.pop();
  var next = function(err, cookies) {
    if (err) {
      cb(err);
    } else {
      cb(
        null,
        cookies
          .sort(cookieCompare)
          .map(function(c) {
            return c.cookieString();
          })
          .join('; ')
      );
    }
  };
  args.push(next);
  this.getCookies.apply(this, args);
};

CAN_BE_SYNC.push('getSetCookieStrings');
CookieJar.prototype.getSetCookieStrings = function(/*..., cb*/) {
  var args = Array.prototype.slice.call(arguments, 0);
  var cb = args.pop();
  var next = function(err, cookies) {
    if (err) {
      cb(err);
    } else {
      cb(
        null,
        cookies.map(function(c) {
          return c.toString();
        })
      );
    }
  };
  args.push(next);
  this.getCookies.apply(this, args);
};

CAN_BE_SYNC.push('serialize');
CookieJar.prototype.serialize = function(cb) {
  var type = this.store.constructor.name;
  if (type === 'Object') {
    type = null;
  }

  // update README.md "Serialization Format" if you change this, please!
  var serialized = {
    // The version of tough-cookie that serialized this jar. Generally a good
    // practice since future versions can make data import decisions based on
    // known past behavior. When/if this matters, use `semver`.
    version: 'tough-cookie@' + VERSION,

    // add the store type, to make humans happy:
    storeType: type,

    // CookieJar configuration:
    rejectPublicSuffixes: !!this.rejectPublicSuffixes,

    // this gets filled from getAllCookies:
    cookies: []
  };

  if (!(this.store.getAllCookies && typeof this.store.getAllCookies === 'function')) {
    return cb(new Error('store does not support getAllCookies and cannot be serialized'));
  }

  this.store.getAllCookies(function(err, cookies) {
    if (err) {
      return cb(err);
    }

    serialized.cookies = cookies.map(function(cookie) {
      // convert to serialized 'raw' cookies
      cookie = cookie instanceof Cookie ? cookie.toJSON() : cookie;

      // Remove the index so new ones get assigned during deserialization
      delete cookie.creationIndex;

      return cookie;
    });

    return cb(null, serialized);
  });
};

// well-known name that JSON.stringify calls
CookieJar.prototype.toJSON = function() {
  return this.serializeSync();
};

// use the class method CookieJar.deserialize instead of calling this directly
CAN_BE_SYNC.push('_importCookies');
CookieJar.prototype._importCookies = function(serialized, cb) {
  var jar = this;
  var cookies = serialized.cookies;
  if (!cookies || !Array.isArray(cookies)) {
    return cb(new Error('serialized jar has no cookies array'));
  }
  cookies = cookies.slice(); // do not modify the original

  function putNext(err) {
    if (err) {
      return cb(err);
    }

    if (!cookies.length) {
      return cb(err, jar);
    }

    var cookie;
    try {
      cookie = fromJSON(cookies.shift());
    } catch (e) {
      return cb(e);
    }

    if (cookie === null) {
      return putNext(null); // skip this cookie
    }

    jar.store.putCookie(cookie, putNext);
  }

  putNext();
};

CookieJar.deserialize = function(strOrObj, store, cb) {
  if (arguments.length !== 3) {
    // store is optional
    cb = store;
    store = null;
  }

  var serialized;
  if (typeof strOrObj === 'string') {
    serialized = jsonParse(strOrObj);
    if (serialized instanceof Error) {
      return cb(serialized);
    }
  } else {
    serialized = strOrObj;
  }

  var jar = new CookieJar(store, serialized.rejectPublicSuffixes);
  jar._importCookies(serialized, function(err) {
    if (err) {
      return cb(err);
    }
    cb(null, jar);
  });
};

CookieJar.deserializeSync = function(strOrObj, store) {
  var serialized = typeof strOrObj === 'string' ? JSON.parse(strOrObj) : strOrObj;
  var jar = new CookieJar(store, serialized.rejectPublicSuffixes);

  // catch this mistake early:
  if (!jar.store.synchronous) {
    throw new Error('CookieJar store is not synchronous; use async API instead.');
  }

  jar._importCookiesSync(serialized);
  return jar;
};
CookieJar.fromJSON = CookieJar.deserializeSync;

CAN_BE_SYNC.push('clone');
CookieJar.prototype.clone = function(newStore, cb) {
  if (arguments.length === 1) {
    cb = newStore;
    newStore = null;
  }

  this.serialize(function(err, serialized) {
    if (err) {
      return cb(err);
    }
    CookieJar.deserialize(newStore, serialized, cb);
  });
};

// Use a closure to provide a true imperative API for synchronous stores.
function syncWrap(method) {
  return function() {
    if (!this.store.synchronous) {
      throw new Error('CookieJar store is not synchronous; use async API instead.');
    }

    var args = Array.prototype.slice.call(arguments);
    var syncErr, syncResult;
    args.push(function syncCb(err, result) {
      syncErr = err;
      syncResult = result;
    });
    this[method].apply(this, args);

    if (syncErr) {
      throw syncErr;
    }
    return syncResult;
  };
}

// wrap all declared CAN_BE_SYNC methods in the sync wrapper
CAN_BE_SYNC.forEach(function(method) {
  CookieJar.prototype[method + 'Sync'] = syncWrap(method);
});

var CookieJar_1 = CookieJar;
var Cookie_1 = Cookie;
var Store_1$1 = Store$2;
var MemoryCookieStore_1$1 = MemoryCookieStore$1;
var parseDate_1 = parseDate;
var formatDate_1 = formatDate;
var parse_1 = parse;
var fromJSON_1 = fromJSON;
var domainMatch_1 = domainMatch;
var defaultPath_1 = defaultPath;
var pathMatch_1$1 = pathMatch$2;
var getPublicSuffix$1 = pubsuffixPsl.getPublicSuffix;
var cookieCompare_1 = cookieCompare;
var permuteDomain$2 = permuteDomain_1.permuteDomain;
var permutePath_1 = permutePath;
var canonicalDomain_1 = canonicalDomain;

var cookie = {
  CookieJar: CookieJar_1,
  Cookie: Cookie_1,
  Store: Store_1$1,
  MemoryCookieStore: MemoryCookieStore_1$1,
  parseDate: parseDate_1,
  formatDate: formatDate_1,
  parse: parse_1,
  fromJSON: fromJSON_1,
  domainMatch: domainMatch_1,
  defaultPath: defaultPath_1,
  pathMatch: pathMatch_1$1,
  getPublicSuffix: getPublicSuffix$1,
  cookieCompare: cookieCompare_1,
  permuteDomain: permuteDomain$2,
  permutePath: permutePath_1,
  canonicalDomain: canonicalDomain_1
};

/* eslint-disable node/no-deprecated-api */

var safeBuffer = _commonjsHelpers.createCommonjsModule(function(module, exports) {
  var Buffer = buffer__default['default'].Buffer;

  // alternative to using Object.keys for old browsers
  function copyProps(src, dst) {
    for (var key in src) {
      dst[key] = src[key];
    }
  }
  if (Buffer.from && Buffer.alloc && Buffer.allocUnsafe && Buffer.allocUnsafeSlow) {
    module.exports = buffer__default['default'];
  } else {
    // Copy properties from require('buffer')
    copyProps(buffer__default['default'], exports);
    exports.Buffer = SafeBuffer;
  }

  function SafeBuffer(arg, encodingOrOffset, length) {
    return Buffer(arg, encodingOrOffset, length);
  }

  SafeBuffer.prototype = Object.create(Buffer.prototype);

  // Copy static methods from Buffer
  copyProps(Buffer, SafeBuffer);

  SafeBuffer.from = function(arg, encodingOrOffset, length) {
    if (typeof arg === 'number') {
      throw new TypeError('Argument must not be a number');
    }
    return Buffer(arg, encodingOrOffset, length);
  };

  SafeBuffer.alloc = function(size, fill, encoding) {
    if (typeof size !== 'number') {
      throw new TypeError('Argument must be a number');
    }
    var buf = Buffer(size);
    if (fill !== undefined) {
      if (typeof encoding === 'string') {
        buf.fill(fill, encoding);
      } else {
        buf.fill(fill);
      }
    } else {
      buf.fill(0);
    }
    return buf;
  };

  SafeBuffer.allocUnsafe = function(size) {
    if (typeof size !== 'number') {
      throw new TypeError('Argument must be a number');
    }
    return Buffer(size);
  };

  SafeBuffer.allocUnsafeSlow = function(size) {
    if (typeof size !== 'number') {
      throw new TypeError('Argument must be a number');
    }
    return buffer__default['default'].SlowBuffer(size);
  };
});

var Buffer$1 = safeBuffer.Buffer;
var httpOverHttp_1 = httpOverHttp;
var httpsOverHttp_1 = httpsOverHttp;
var httpOverHttps_1 = httpOverHttps;
var httpsOverHttps_1 = httpsOverHttps;

function httpOverHttp(options) {
  var agent = new TunnelingAgent(options);
  agent.request = http__default['default'].request;
  return agent;
}

function httpsOverHttp(options) {
  var agent = new TunnelingAgent(options);
  agent.request = http__default['default'].request;
  agent.createSocket = createSecureSocket;
  agent.defaultPort = 443;
  return agent;
}

function httpOverHttps(options) {
  var agent = new TunnelingAgent(options);
  agent.request = https__default['default'].request;
  return agent;
}

function httpsOverHttps(options) {
  var agent = new TunnelingAgent(options);
  agent.request = https__default['default'].request;
  agent.createSocket = createSecureSocket;
  agent.defaultPort = 443;
  return agent;
}

function TunnelingAgent(options) {
  var self = this;
  self.options = options || {};
  self.proxyOptions = self.options.proxy || {};
  self.maxSockets = self.options.maxSockets || http__default['default'].Agent.defaultMaxSockets;
  self.requests = [];
  self.sockets = [];

  self.on('free', function onFree(socket, host, port) {
    for (var i = 0, len = self.requests.length; i < len; ++i) {
      var pending = self.requests[i];
      if (pending.host === host && pending.port === port) {
        // Detect the request to connect same origin server,
        // reuse the connection.
        self.requests.splice(i, 1);
        pending.request.onSocket(socket);
        return;
      }
    }
    socket.destroy();
    self.removeSocket(socket);
  });
}
util__default['default'].inherits(TunnelingAgent, events__default['default'].EventEmitter);

TunnelingAgent.prototype.addRequest = function addRequest(req, options) {
  var self = this;

  // Legacy API: addRequest(req, host, port, path)
  if (typeof options === 'string') {
    options = {
      host: options,
      port: arguments[2],
      path: arguments[3]
    };
  }

  if (self.sockets.length >= this.maxSockets) {
    // We are over limit so we'll add it to the queue.
    self.requests.push({ host: options.host, port: options.port, request: req });
    return;
  }

  // If we are under maxSockets create a new one.
  self.createConnection({ host: options.host, port: options.port, request: req });
};

TunnelingAgent.prototype.createConnection = function createConnection(pending) {
  var self = this;

  self.createSocket(pending, function(socket) {
    socket.on('free', onFree);
    socket.on('close', onCloseOrRemove);
    socket.on('agentRemove', onCloseOrRemove);
    pending.request.onSocket(socket);

    function onFree() {
      self.emit('free', socket, pending.host, pending.port);
    }

    function onCloseOrRemove(err) {
      self.removeSocket(socket);
      socket.removeListener('free', onFree);
      socket.removeListener('close', onCloseOrRemove);
      socket.removeListener('agentRemove', onCloseOrRemove);
    }
  });
};

TunnelingAgent.prototype.createSocket = function createSocket(options, cb) {
  var self = this;
  var placeholder = {};
  self.sockets.push(placeholder);

  var connectOptions = mergeOptions({}, self.proxyOptions, {
    method: 'CONNECT',
    path: options.host + ':' + options.port,
    agent: false
  });
  if (connectOptions.proxyAuth) {
    connectOptions.headers = connectOptions.headers || {};
    connectOptions.headers['Proxy-Authorization'] =
      'Basic ' + Buffer$1.from(connectOptions.proxyAuth).toString('base64');
  }

  debug('making CONNECT request');
  var connectReq = self.request(connectOptions);
  connectReq.useChunkedEncodingByDefault = false; // for v0.6
  connectReq.once('response', onResponse); // for v0.6
  connectReq.once('upgrade', onUpgrade); // for v0.6
  connectReq.once('connect', onConnect); // for v0.7 or later
  connectReq.once('error', onError);
  connectReq.end();

  function onResponse(res) {
    // Very hacky. This is necessary to avoid http-parser leaks.
    res.upgrade = true;
  }

  function onUpgrade(res, socket, head) {
    // Hacky.
    process.nextTick(function() {
      onConnect(res, socket, head);
    });
  }

  function onConnect(res, socket, head) {
    connectReq.removeAllListeners();
    socket.removeAllListeners();

    if (res.statusCode === 200) {
      assert__default['default'].equal(head.length, 0);
      debug('tunneling connection has established');
      self.sockets[self.sockets.indexOf(placeholder)] = socket;
      cb(socket);
    } else {
      debug('tunneling socket could not be established, statusCode=%d', res.statusCode);
      var error = new Error('tunneling socket could not be established, ' + 'statusCode=' + res.statusCode);
      error.code = 'ECONNRESET';
      options.request.emit('error', error);
      self.removeSocket(placeholder);
    }
  }

  function onError(cause) {
    connectReq.removeAllListeners();

    debug('tunneling socket could not be established, cause=%s\n', cause.message, cause.stack);
    var error = new Error('tunneling socket could not be established, ' + 'cause=' + cause.message);
    error.code = 'ECONNRESET';
    options.request.emit('error', error);
    self.removeSocket(placeholder);
  }
};

TunnelingAgent.prototype.removeSocket = function removeSocket(socket) {
  var pos = this.sockets.indexOf(socket);
  if (pos === -1) return;

  this.sockets.splice(pos, 1);

  var pending = this.requests.shift();
  if (pending) {
    // If we have pending requests and a socket gets closed a new one
    // needs to be created to take over in the pool for the one that closed.
    this.createConnection(pending);
  }
};

function createSecureSocket(options, cb) {
  var self = this;
  TunnelingAgent.prototype.createSocket.call(self, options, function(socket) {
    // 0 is dummy port for v0.6
    var secureSocket = tls__default['default'].connect(
      0,
      mergeOptions({}, self.options, { servername: options.host, socket: socket })
    );
    self.sockets[self.sockets.indexOf(socket)] = secureSocket;
    cb(secureSocket);
  });
}

function mergeOptions(target) {
  for (var i = 1, len = arguments.length; i < len; ++i) {
    var overrides = arguments[i];
    if (typeof overrides === 'object') {
      var keys = Object.keys(overrides);
      for (var j = 0, keyLen = keys.length; j < keyLen; ++j) {
        var k = keys[j];
        if (overrides[k] !== undefined) {
          target[k] = overrides[k];
        }
      }
    }
  }
  return target;
}

var debug;
if (process.env.NODE_DEBUG && /\btunnel\b/.test(process.env.NODE_DEBUG)) {
  debug = function() {
    var args = Array.prototype.slice.call(arguments);
    if (typeof args[0] === 'string') {
      args[0] = 'TUNNEL: ' + args[0];
    } else {
      args.unshift('TUNNEL:');
    }
    console.error.apply(console, args);
  };
} else {
  debug = function() {};
}
var debug_1 = debug; // for test

var tunnelAgent = {
  httpOverHttp: httpOverHttp_1,
  httpsOverHttp: httpsOverHttp_1,
  httpOverHttps: httpOverHttps_1,
  httpsOverHttps: httpsOverHttps_1,
  debug: debug_1
};

var freeTasks = [];

/**
 * Calls a task as soon as possible after returning, in its own event, with
 * priority over IO events. An exception thrown in a task can be handled by
 * `process.on("uncaughtException") or `domain.on("error")`, but will otherwise
 * crash the process. If the error is handled, all subsequent tasks will
 * resume.
 *
 * @param {{call}} task A callable object, typically a function that takes no
 * arguments.
 */
var asap_1 = asap;
function asap(task) {
  var rawTask;
  if (freeTasks.length) {
    rawTask = freeTasks.pop();
  } else {
    rawTask = new RawTask();
  }
  rawTask.task = task;
  rawTask.domain = process.domain;
  raw(rawTask);
}

function RawTask() {
  this.task = null;
  this.domain = null;
}

RawTask.prototype.call = function() {
  if (this.domain) {
    this.domain.enter();
  }
  var threw = true;
  try {
    this.task.call();
    threw = false;
    // If the task throws an exception (presumably) Node.js restores the
    // domain stack for the next event.
    if (this.domain) {
      this.domain.exit();
    }
  } finally {
    // We use try/finally and a threw flag to avoid messing up stack traces
    // when we catch and release errors.
    if (threw) {
      // In Node.js, uncaught exceptions are considered fatal errors.
      // Re-throw them to interrupt flushing!
      // Ensure that flushing continues if an uncaught exception is
      // suppressed listening process.on("uncaughtException") or
      // domain.on("error").
      raw.requestFlush();
    }
    // If the task threw an error, we do not want to exit the domain here.
    // Exiting the domain would prevent the domain from catching the error.
    this.task = null;
    this.domain = null;
    freeTasks.push(this);
  }
};

var Stream = function(sequence, bits) {
  bits = bits || (sequence instanceof Buffer ? 8 : 1);
  var binary = '',
    b,
    i,
    n;

  for (i = 0, n = sequence.length; i < n; i++) {
    b = this._get(sequence, i).toString(2);
    while (b.length < bits) b = '0' + b;
    binary = binary + b;
  }
  binary = binary.split('').map(function(b) {
    return parseInt(b, 2);
  });

  this._bases = { '2': binary };
};

Stream.prototype.generate = function(n, base, inner) {
  base = base || 2;

  var value = n,
    k = Math.ceil(Math.log(n) / Math.log(base)),
    r = Math.pow(base, k) - n,
    chunk;

  loop: while (value >= n) {
    chunk = this._shift(base, k);
    if (!chunk) return inner ? n : null;

    value = this._evaluate(chunk, base);

    if (value >= n) {
      if (r === 1) continue loop;
      this._push(r, value - n);
      value = this.generate(n, r, true);
    }
  }
  return value;
};

Stream.prototype._get = function(sequence, i) {
  return sequence.readUInt8 ? sequence.readUInt8(i) : sequence[i];
};

Stream.prototype._evaluate = function(chunk, base) {
  var sum = 0,
    i = chunk.length;

  while (i--) sum += chunk[i] * Math.pow(base, chunk.length - (i + 1));
  return sum;
};

Stream.prototype._push = function(base, value) {
  this._bases[base] = this._bases[base] || [];
  this._bases[base].push(value);
};

Stream.prototype._shift = function(base, k) {
  var list = this._bases[base];
  if (!list || list.length < k) return null;
  else return list.splice(0, k);
};

var sequin = Stream;

var DEFAULT_BITS = 128,
  DEFAULT_RADIX = 16,
  DIGITS = '0123456789abcdefghijklmnopqrstuvwxyz'.split('');

var rand = function(bits, radix) {
  bits = bits || DEFAULT_BITS;
  radix = radix || DEFAULT_RADIX;

  if (radix < 2 || radix > 36) throw new Error('radix argument must be between 2 and 36');

  var length = Math.ceil((bits * Math.log(2)) / Math.log(radix)),
    entropy = crypto__default['default'].randomBytes(bits),
    stream = new sequin(entropy),
    string = '';

  while (string.length < length) string += DIGITS[stream.generate(radix)];

  return string;
};

var csprng = rand;

/**

Streams in a WebSocket connection
---------------------------------

We model a WebSocket as two duplex streams: one stream is for the wire protocol
over an I/O socket, and the other is for incoming/outgoing messages.


                        +----------+      +---------+      +----------+
    [1] write(chunk) -->| ~~~~~~~~ +----->| parse() +----->| ~~~~~~~~ +--> emit('data') [2]
                        |          |      +----+----+      |          |
                        |          |           |           |          |
                        |    IO    |           | [5]       | Messages |
                        |          |           V           |          |
                        |          |      +---------+      |          |
    [4] emit('data') <--+ ~~~~~~~~ |<-----+ frame() |<-----+ ~~~~~~~~ |<-- write(chunk) [3]
                        +----------+      +---------+      +----------+


Message transfer in each direction is simple: IO receives a byte stream [1] and
sends this stream for parsing. The parser will periodically emit a complete
message text on the Messages stream [2]. Similarly, when messages are written
to the Messages stream [3], they are framed using the WebSocket wire format and
emitted via IO [4].

There is a feedback loop via [5] since some input from [1] will be things like
ping, pong and close frames. In these cases the protocol responds by emitting
responses directly back to [4] rather than emitting messages via [2].

For the purposes of flow control, we consider the sources of each Readable
stream to be as follows:

* [2] receives input from [1]
* [4] receives input from [1] and [3]

The classes below express the relationships described above without prescribing
anything about how parse() and frame() work, other than assuming they emit
'data' events to the IO and Messages streams. They will work with any protocol
driver having these two methods.
**/

var Stream$1 = Stream__default['default'].Stream;

var IO = function(driver) {
  this.readable = this.writable = true;
  this._paused = false;
  this._driver = driver;
};
util__default['default'].inherits(IO, Stream$1);

// The IO pause() and resume() methods will be called when the socket we are
// piping to gets backed up and drains. Since IO output [4] comes from IO input
// [1] and Messages input [3], we need to tell both of those to return false
// from write() when this stream is paused.

IO.prototype.pause = function() {
  this._paused = true;
  this._driver.messages._paused = true;
};

IO.prototype.resume = function() {
  this._paused = false;
  this.emit('drain');

  var messages = this._driver.messages;
  messages._paused = false;
  messages.emit('drain');
};

// When we receive input from a socket, send it to the parser and tell the
// source whether to back off.
IO.prototype.write = function(chunk) {
  if (!this.writable) return false;
  this._driver.parse(chunk);
  return !this._paused;
};

// The IO end() method will be called when the socket piping into it emits
// 'close' or 'end', i.e. the socket is closed. In this situation the Messages
// stream will not emit any more data so we emit 'end'.
IO.prototype.end = function(chunk) {
  if (!this.writable) return;
  if (chunk !== undefined) this.write(chunk);
  this.writable = false;

  var messages = this._driver.messages;
  if (messages.readable) {
    messages.readable = messages.writable = false;
    messages.emit('end');
  }
};

IO.prototype.destroy = function() {
  this.end();
};

var Messages = function(driver) {
  this.readable = this.writable = true;
  this._paused = false;
  this._driver = driver;
};
util__default['default'].inherits(Messages, Stream$1);

// The Messages pause() and resume() methods will be called when the app that's
// processing the messages gets backed up and drains. If we're emitting
// messages too fast we should tell the source to slow down. Message output [2]
// comes from IO input [1].

Messages.prototype.pause = function() {
  this._driver.io._paused = true;
};

Messages.prototype.resume = function() {
  this._driver.io._paused = false;
  this._driver.io.emit('drain');
};

// When we receive messages from the user, send them to the formatter and tell
// the source whether to back off.
Messages.prototype.write = function(message) {
  if (!this.writable) return false;
  if (typeof message === 'string') this._driver.text(message);
  else this._driver.binary(message);
  return !this._paused;
};

// The Messages end() method will be called when a stream piping into it emits
// 'end'. Many streams may be piped into the WebSocket and one of them ending
// does not mean the whole socket is done, so just process the input and move
// on leaving the socket open.
Messages.prototype.end = function(message) {
  if (message !== undefined) this.write(message);
};

Messages.prototype.destroy = function() {};

var IO_1 = IO;
var Messages_1 = Messages;

var streams = {
  IO: IO_1,
  Messages: Messages_1
};

var Headers = function() {
  this.clear();
};

Headers.prototype.ALLOWED_DUPLICATES = ['set-cookie', 'set-cookie2', 'warning', 'www-authenticate'];

Headers.prototype.clear = function() {
  this._sent = {};
  this._lines = [];
};

Headers.prototype.set = function(name, value) {
  if (value === undefined) return;

  name = this._strip(name);
  value = this._strip(value);

  var key = name.toLowerCase();
  if (!this._sent.hasOwnProperty(key) || this.ALLOWED_DUPLICATES.indexOf(key) >= 0) {
    this._sent[key] = true;
    this._lines.push(name + ': ' + value + '\r\n');
  }
};

Headers.prototype.toString = function() {
  return this._lines.join('');
};

Headers.prototype._strip = function(string) {
  return string
    .toString()
    .replace(/^ */, '')
    .replace(/ *$/, '');
};

var headers = Headers;

var Buffer$2 = safeBuffer.Buffer;

var StreamReader = function() {
  this._queue = [];
  this._queueSize = 0;
  this._offset = 0;
};

StreamReader.prototype.put = function(buffer) {
  if (!buffer || buffer.length === 0) return;
  if (!Buffer$2.isBuffer(buffer)) buffer = Buffer$2.from(buffer);
  this._queue.push(buffer);
  this._queueSize += buffer.length;
};

StreamReader.prototype.read = function(length) {
  if (length > this._queueSize) return null;
  if (length === 0) return Buffer$2.alloc(0);

  this._queueSize -= length;

  var queue = this._queue,
    remain = length,
    first = queue[0],
    buffers,
    buffer;

  if (first.length >= length) {
    if (first.length === length) {
      return queue.shift();
    } else {
      buffer = first.slice(0, length);
      queue[0] = first.slice(length);
      return buffer;
    }
  }

  for (var i = 0, n = queue.length; i < n; i++) {
    if (remain < queue[i].length) break;
    remain -= queue[i].length;
  }
  buffers = queue.splice(0, i);

  if (remain > 0 && queue.length > 0) {
    buffers.push(queue[0].slice(0, remain));
    queue[0] = queue[0].slice(remain);
  }
  return Buffer$2.concat(buffers, length);
};

StreamReader.prototype.eachByte = function(callback, context) {
  var buffer, n, index;

  while (this._queue.length > 0) {
    buffer = this._queue[0];
    n = buffer.length;

    while (this._offset < n) {
      index = this._offset;
      this._offset += 1;
      callback.call(context, buffer[index]);
    }
    this._offset = 0;
    this._queue.shift();
  }
};

var stream_reader = StreamReader;

var Buffer$3 = safeBuffer.Buffer,
  Emitter = events__default['default'].EventEmitter;

var Base = function(request, url, options) {
  Emitter.call(this);
  Base.validateOptions(options || {}, ['maxLength', 'masking', 'requireMasking', 'protocols']);

  this._request = request;
  this._reader = new stream_reader();
  this._options = options || {};
  this._maxLength = this._options.maxLength || this.MAX_LENGTH;
  this._headers = new headers();
  this.__queue = [];
  this.readyState = 0;
  this.url = url;

  this.io = new streams.IO(this);
  this.messages = new streams.Messages(this);
  this._bindEventListeners();
};
util__default['default'].inherits(Base, Emitter);

Base.isWebSocket = function(request) {
  var connection = request.headers.connection || '',
    upgrade = request.headers.upgrade || '';

  return (
    request.method === 'GET' &&
    connection
      .toLowerCase()
      .split(/ *, */)
      .indexOf('upgrade') >= 0 &&
    upgrade.toLowerCase() === 'websocket'
  );
};

Base.validateOptions = function(options, validKeys) {
  for (var key in options) {
    if (validKeys.indexOf(key) < 0) throw new Error('Unrecognized option: ' + key);
  }
};

var instance = {
  // This is 64MB, small enough for an average VPS to handle without
  // crashing from process out of memory
  MAX_LENGTH: 0x3ffffff,

  STATES: ['connecting', 'open', 'closing', 'closed'],

  _bindEventListeners: function() {
    var self = this;

    // Protocol errors are informational and do not have to be handled
    this.messages.on('error', function() {});

    this.on('message', function(event) {
      var messages = self.messages;
      if (messages.readable) messages.emit('data', event.data);
    });

    this.on('error', function(error) {
      var messages = self.messages;
      if (messages.readable) messages.emit('error', error);
    });

    this.on('close', function() {
      var messages = self.messages;
      if (!messages.readable) return;
      messages.readable = messages.writable = false;
      messages.emit('end');
    });
  },

  getState: function() {
    return this.STATES[this.readyState] || null;
  },

  addExtension: function(extension) {
    return false;
  },

  setHeader: function(name, value) {
    if (this.readyState > 0) return false;
    this._headers.set(name, value);
    return true;
  },

  start: function() {
    if (this.readyState !== 0) return false;

    if (!Base.isWebSocket(this._request)) return this._failHandshake(new Error('Not a WebSocket request'));

    var response;

    try {
      response = this._handshakeResponse();
    } catch (error) {
      return this._failHandshake(error);
    }

    this._write(response);
    if (this._stage !== -1) this._open();
    return true;
  },

  _failHandshake: function(error) {
    var headers$1 = new headers();
    headers$1.set('Content-Type', 'text/plain');
    headers$1.set('Content-Length', Buffer$3.byteLength(error.message, 'utf8'));

    headers$1 = ['HTTP/1.1 400 Bad Request', headers$1.toString(), error.message];
    this._write(Buffer$3.from(headers$1.join('\r\n'), 'utf8'));
    this._fail('protocol_error', error.message);

    return false;
  },

  text: function(message) {
    return this.frame(message);
  },

  binary: function(message) {
    return false;
  },

  ping: function() {
    return false;
  },

  pong: function() {
    return false;
  },

  close: function(reason, code) {
    if (this.readyState !== 1) return false;
    this.readyState = 3;
    this.emit('close', new Base.CloseEvent(null, null));
    return true;
  },

  _open: function() {
    this.readyState = 1;
    this.__queue.forEach(function(args) {
      this.frame.apply(this, args);
    }, this);
    this.__queue = [];
    this.emit('open', new Base.OpenEvent());
  },

  _queue: function(message) {
    this.__queue.push(message);
    return true;
  },

  _write: function(chunk) {
    var io = this.io;
    if (io.readable) io.emit('data', chunk);
  },

  _fail: function(type, message) {
    this.readyState = 2;
    this.emit('error', new Error(message));
    this.close();
  }
};

for (var key in instance) Base.prototype[key] = instance[key];

Base.ConnectEvent = function() {};

Base.OpenEvent = function() {};

Base.CloseEvent = function(code, reason) {
  this.code = code;
  this.reason = reason;
};

Base.MessageEvent = function(data) {
  this.data = data;
};

Base.PingEvent = function(data) {
  this.data = data;
};

Base.PongEvent = function(data) {
  this.data = data;
};

var base = Base;

/*jshint node:true */

var httpParser = _commonjsHelpers.createCommonjsModule(function(module, exports) {
  exports.HTTPParser = HTTPParser;
  function HTTPParser(type) {
    assert__default['default'].ok(type === HTTPParser.REQUEST || type === HTTPParser.RESPONSE);
    this.type = type;
    this.state = type + '_LINE';
    this.info = {
      headers: [],
      upgrade: false
    };
    this.trailers = [];
    this.line = '';
    this.isChunked = false;
    this.connection = '';
    this.headerSize = 0; // for preventing too big headers
    this.body_bytes = null;
    this.isUserCall = false;
    this.hadError = false;
  }
  HTTPParser.maxHeaderSize = 80 * 1024; // maxHeaderSize (in bytes) is configurable, but 80kb by default;
  HTTPParser.REQUEST = 'REQUEST';
  HTTPParser.RESPONSE = 'RESPONSE';
  var kOnHeaders = (HTTPParser.kOnHeaders = 0);
  var kOnHeadersComplete = (HTTPParser.kOnHeadersComplete = 1);
  var kOnBody = (HTTPParser.kOnBody = 2);
  var kOnMessageComplete = (HTTPParser.kOnMessageComplete = 3);

  // Some handler stubs, needed for compatibility
  HTTPParser.prototype[kOnHeaders] = HTTPParser.prototype[kOnHeadersComplete] = HTTPParser.prototype[
    kOnBody
  ] = HTTPParser.prototype[kOnMessageComplete] = function() {};

  var compatMode0_12 = true;
  Object.defineProperty(HTTPParser, 'kOnExecute', {
    get: function() {
      // hack for backward compatibility
      compatMode0_12 = false;
      return 4;
    }
  });

  var methods = (exports.methods = HTTPParser.methods = [
    'DELETE',
    'GET',
    'HEAD',
    'POST',
    'PUT',
    'CONNECT',
    'OPTIONS',
    'TRACE',
    'COPY',
    'LOCK',
    'MKCOL',
    'MOVE',
    'PROPFIND',
    'PROPPATCH',
    'SEARCH',
    'UNLOCK',
    'BIND',
    'REBIND',
    'UNBIND',
    'ACL',
    'REPORT',
    'MKACTIVITY',
    'CHECKOUT',
    'MERGE',
    'M-SEARCH',
    'NOTIFY',
    'SUBSCRIBE',
    'UNSUBSCRIBE',
    'PATCH',
    'PURGE',
    'MKCALENDAR',
    'LINK',
    'UNLINK'
  ]);
  HTTPParser.prototype.reinitialize = HTTPParser;
  HTTPParser.prototype.close = HTTPParser.prototype.pause = HTTPParser.prototype.resume = HTTPParser.prototype.free = function() {};
  HTTPParser.prototype._compatMode0_11 = false;
  HTTPParser.prototype.getAsyncId = function() {
    return 0;
  };

  var headerState = {
    REQUEST_LINE: true,
    RESPONSE_LINE: true,
    HEADER: true
  };
  HTTPParser.prototype.execute = function(chunk, start, length) {
    if (!(this instanceof HTTPParser)) {
      throw new TypeError('not a HTTPParser');
    }

    // backward compat to node < 0.11.4
    // Note: the start and length params were removed in newer version
    start = start || 0;
    length = typeof length === 'number' ? length : chunk.length;

    this.chunk = chunk;
    this.offset = start;
    var end = (this.end = start + length);
    try {
      while (this.offset < end) {
        if (this[this.state]()) {
          break;
        }
      }
    } catch (err) {
      if (this.isUserCall) {
        throw err;
      }
      this.hadError = true;
      return err;
    }
    this.chunk = null;
    length = this.offset - start;
    if (headerState[this.state]) {
      this.headerSize += length;
      if (this.headerSize > HTTPParser.maxHeaderSize) {
        return new Error('max header size exceeded');
      }
    }
    return length;
  };

  var stateFinishAllowed = {
    REQUEST_LINE: true,
    RESPONSE_LINE: true,
    BODY_RAW: true
  };
  HTTPParser.prototype.finish = function() {
    if (this.hadError) {
      return;
    }
    if (!stateFinishAllowed[this.state]) {
      return new Error('invalid state for EOF');
    }
    if (this.state === 'BODY_RAW') {
      this.userCall()(this[kOnMessageComplete]());
    }
  };

  // These three methods are used for an internal speed optimization, and it also
  // works if theses are noops. Basically consume() asks us to read the bytes
  // ourselves, but if we don't do it we get them through execute().
  HTTPParser.prototype.consume = HTTPParser.prototype.unconsume = HTTPParser.prototype.getCurrentBuffer = function() {};

  //For correct error handling - see HTTPParser#execute
  //Usage: this.userCall()(userFunction('arg'));
  HTTPParser.prototype.userCall = function() {
    this.isUserCall = true;
    var self = this;
    return function(ret) {
      self.isUserCall = false;
      return ret;
    };
  };

  HTTPParser.prototype.nextRequest = function() {
    this.userCall()(this[kOnMessageComplete]());
    this.reinitialize(this.type);
  };

  HTTPParser.prototype.consumeLine = function() {
    var end = this.end,
      chunk = this.chunk;
    for (var i = this.offset; i < end; i++) {
      if (chunk[i] === 0x0a) {
        // \n
        var line = this.line + chunk.toString('ascii', this.offset, i);
        if (line.charAt(line.length - 1) === '\r') {
          line = line.substr(0, line.length - 1);
        }
        this.line = '';
        this.offset = i + 1;
        return line;
      }
    }
    //line split over multiple chunks
    this.line += chunk.toString('ascii', this.offset, this.end);
    this.offset = this.end;
  };

  var headerExp = /^([^: \t]+):[ \t]*((?:.*[^ \t])|)/;
  var headerContinueExp = /^[ \t]+(.*[^ \t])/;
  HTTPParser.prototype.parseHeader = function(line, headers) {
    if (line.indexOf('\r') !== -1) {
      throw parseErrorCode('HPE_LF_EXPECTED');
    }

    var match = headerExp.exec(line);
    var k = match && match[1];
    if (k) {
      // skip empty string (malformed header)
      headers.push(k);
      headers.push(match[2]);
    } else {
      var matchContinue = headerContinueExp.exec(line);
      if (matchContinue && headers.length) {
        if (headers[headers.length - 1]) {
          headers[headers.length - 1] += ' ';
        }
        headers[headers.length - 1] += matchContinue[1];
      }
    }
  };

  var requestExp = /^([A-Z-]+) ([^ ]+) HTTP\/(\d)\.(\d)$/;
  HTTPParser.prototype.REQUEST_LINE = function() {
    var line = this.consumeLine();
    if (!line) {
      return;
    }
    var match = requestExp.exec(line);
    if (match === null) {
      throw parseErrorCode('HPE_INVALID_CONSTANT');
    }
    this.info.method = this._compatMode0_11 ? match[1] : methods.indexOf(match[1]);
    if (this.info.method === -1) {
      throw new Error('invalid request method');
    }
    if (match[1] === 'CONNECT') {
      this.info.upgrade = true;
    }
    this.info.url = match[2];
    this.info.versionMajor = +match[3];
    this.info.versionMinor = +match[4];
    this.body_bytes = 0;
    this.state = 'HEADER';
  };

  var responseExp = /^HTTP\/(\d)\.(\d) (\d{3}) ?(.*)$/;
  HTTPParser.prototype.RESPONSE_LINE = function() {
    var line = this.consumeLine();
    if (!line) {
      return;
    }
    var match = responseExp.exec(line);
    if (match === null) {
      throw parseErrorCode('HPE_INVALID_CONSTANT');
    }
    this.info.versionMajor = +match[1];
    this.info.versionMinor = +match[2];
    var statusCode = (this.info.statusCode = +match[3]);
    this.info.statusMessage = match[4];
    // Implied zero length.
    if (((statusCode / 100) | 0) === 1 || statusCode === 204 || statusCode === 304) {
      this.body_bytes = 0;
    }
    this.state = 'HEADER';
  };

  HTTPParser.prototype.shouldKeepAlive = function() {
    if (this.info.versionMajor > 0 && this.info.versionMinor > 0) {
      if (this.connection.indexOf('close') !== -1) {
        return false;
      }
    } else if (this.connection.indexOf('keep-alive') === -1) {
      return false;
    }
    if (this.body_bytes !== null || this.isChunked) {
      // || skipBody
      return true;
    }
    return false;
  };

  HTTPParser.prototype.HEADER = function() {
    var line = this.consumeLine();
    if (line === undefined) {
      return;
    }
    var info = this.info;
    if (line) {
      this.parseHeader(line, info.headers);
    } else {
      var headers = info.headers;
      var hasContentLength = false;
      var currentContentLengthValue;
      for (var i = 0; i < headers.length; i += 2) {
        switch (headers[i].toLowerCase()) {
          case 'transfer-encoding':
            this.isChunked = headers[i + 1].toLowerCase() === 'chunked';
            break;
          case 'content-length':
            currentContentLengthValue = +headers[i + 1];
            if (hasContentLength) {
              // Fix duplicate Content-Length header with same values.
              // Throw error only if values are different.
              // Known issues:
              // https://github.com/request/request/issues/2091#issuecomment-328715113
              // https://github.com/nodejs/node/issues/6517#issuecomment-216263771
              if (currentContentLengthValue !== this.body_bytes) {
                throw parseErrorCode('HPE_UNEXPECTED_CONTENT_LENGTH');
              }
            } else {
              hasContentLength = true;
              this.body_bytes = currentContentLengthValue;
            }
            break;
          case 'connection':
            this.connection += headers[i + 1].toLowerCase();
            break;
          case 'upgrade':
            info.upgrade = true;
            break;
        }
      }

      if (this.isChunked && hasContentLength) {
        throw parseErrorCode('HPE_UNEXPECTED_CONTENT_LENGTH');
      }

      info.shouldKeepAlive = this.shouldKeepAlive();
      //problem which also exists in original node: we should know skipBody before calling onHeadersComplete
      var skipBody;
      if (compatMode0_12) {
        skipBody = this.userCall()(this[kOnHeadersComplete](info));
      } else {
        skipBody = this.userCall()(
          this[kOnHeadersComplete](
            info.versionMajor,
            info.versionMinor,
            info.headers,
            info.method,
            info.url,
            info.statusCode,
            info.statusMessage,
            info.upgrade,
            info.shouldKeepAlive
          )
        );
      }
      if (info.upgrade || skipBody === 2) {
        this.nextRequest();
        return true;
      } else if (this.isChunked && !skipBody) {
        this.state = 'BODY_CHUNKHEAD';
      } else if (skipBody || this.body_bytes === 0) {
        this.nextRequest();
      } else if (this.body_bytes === null) {
        this.state = 'BODY_RAW';
      } else {
        this.state = 'BODY_SIZED';
      }
    }
  };

  HTTPParser.prototype.BODY_CHUNKHEAD = function() {
    var line = this.consumeLine();
    if (line === undefined) {
      return;
    }
    this.body_bytes = parseInt(line, 16);
    if (!this.body_bytes) {
      this.state = 'BODY_CHUNKTRAILERS';
    } else {
      this.state = 'BODY_CHUNK';
    }
  };

  HTTPParser.prototype.BODY_CHUNK = function() {
    var length = Math.min(this.end - this.offset, this.body_bytes);
    this.userCall()(this[kOnBody](this.chunk, this.offset, length));
    this.offset += length;
    this.body_bytes -= length;
    if (!this.body_bytes) {
      this.state = 'BODY_CHUNKEMPTYLINE';
    }
  };

  HTTPParser.prototype.BODY_CHUNKEMPTYLINE = function() {
    var line = this.consumeLine();
    if (line === undefined) {
      return;
    }
    assert__default['default'].equal(line, '');
    this.state = 'BODY_CHUNKHEAD';
  };

  HTTPParser.prototype.BODY_CHUNKTRAILERS = function() {
    var line = this.consumeLine();
    if (line === undefined) {
      return;
    }
    if (line) {
      this.parseHeader(line, this.trailers);
    } else {
      if (this.trailers.length) {
        this.userCall()(this[kOnHeaders](this.trailers, ''));
      }
      this.nextRequest();
    }
  };

  HTTPParser.prototype.BODY_RAW = function() {
    var length = this.end - this.offset;
    this.userCall()(this[kOnBody](this.chunk, this.offset, length));
    this.offset = this.end;
  };

  HTTPParser.prototype.BODY_SIZED = function() {
    var length = Math.min(this.end - this.offset, this.body_bytes);
    this.userCall()(this[kOnBody](this.chunk, this.offset, length));
    this.offset += length;
    this.body_bytes -= length;
    if (!this.body_bytes) {
      this.nextRequest();
    }
  };

  // backward compat to node < 0.11.6
  ['Headers', 'HeadersComplete', 'Body', 'MessageComplete'].forEach(function(name) {
    var k = HTTPParser['kOn' + name];
    Object.defineProperty(HTTPParser.prototype, 'on' + name, {
      get: function() {
        return this[k];
      },
      set: function(to) {
        // hack for backward compatibility
        this._compatMode0_11 = true;
        return (this[k] = to);
      }
    });
  });

  function parseErrorCode(code) {
    var err = new Error('Parse Error');
    err.code = code;
    return err;
  }
});

var NodeHTTPParser = httpParser.HTTPParser,
  Buffer$4 = safeBuffer.Buffer;

var TYPES = {
  request: NodeHTTPParser.REQUEST || 'request',
  response: NodeHTTPParser.RESPONSE || 'response'
};

var HttpParser = function(type) {
  this._type = type;
  this._parser = new NodeHTTPParser(TYPES[type]);
  this._complete = false;
  this.headers = {};

  var current = null,
    self = this;

  this._parser.onHeaderField = function(b, start, length) {
    current = b.toString('utf8', start, start + length).toLowerCase();
  };

  this._parser.onHeaderValue = function(b, start, length) {
    var value = b.toString('utf8', start, start + length);

    if (self.headers.hasOwnProperty(current)) self.headers[current] += ', ' + value;
    else self.headers[current] = value;
  };

  this._parser.onHeadersComplete = this._parser[NodeHTTPParser.kOnHeadersComplete] = function(
    majorVersion,
    minorVersion,
    headers,
    method,
    pathname,
    statusCode
  ) {
    var info = arguments[0];

    if (typeof info === 'object') {
      method = info.method;
      pathname = info.url;
      statusCode = info.statusCode;
      headers = info.headers;
    }

    self.method = typeof method === 'number' ? HttpParser.METHODS[method] : method;
    self.statusCode = statusCode;
    self.url = pathname;

    if (!headers) return;

    for (var i = 0, n = headers.length, key, value; i < n; i += 2) {
      key = headers[i].toLowerCase();
      value = headers[i + 1];
      if (self.headers.hasOwnProperty(key)) self.headers[key] += ', ' + value;
      else self.headers[key] = value;
    }

    self._complete = true;
  };
};

HttpParser.METHODS = {
  0: 'DELETE',
  1: 'GET',
  2: 'HEAD',
  3: 'POST',
  4: 'PUT',
  5: 'CONNECT',
  6: 'OPTIONS',
  7: 'TRACE',
  8: 'COPY',
  9: 'LOCK',
  10: 'MKCOL',
  11: 'MOVE',
  12: 'PROPFIND',
  13: 'PROPPATCH',
  14: 'SEARCH',
  15: 'UNLOCK',
  16: 'BIND',
  17: 'REBIND',
  18: 'UNBIND',
  19: 'ACL',
  20: 'REPORT',
  21: 'MKACTIVITY',
  22: 'CHECKOUT',
  23: 'MERGE',
  24: 'M-SEARCH',
  25: 'NOTIFY',
  26: 'SUBSCRIBE',
  27: 'UNSUBSCRIBE',
  28: 'PATCH',
  29: 'PURGE',
  30: 'MKCALENDAR',
  31: 'LINK',
  32: 'UNLINK'
};

var VERSION$1 = (process.version || '').match(/[0-9]+/g).map(function(n) {
  return parseInt(n, 10);
});

if (VERSION$1[0] === 0 && VERSION$1[1] === 12) {
  HttpParser.METHODS[16] = 'REPORT';
  HttpParser.METHODS[17] = 'MKACTIVITY';
  HttpParser.METHODS[18] = 'CHECKOUT';
  HttpParser.METHODS[19] = 'MERGE';
  HttpParser.METHODS[20] = 'M-SEARCH';
  HttpParser.METHODS[21] = 'NOTIFY';
  HttpParser.METHODS[22] = 'SUBSCRIBE';
  HttpParser.METHODS[23] = 'UNSUBSCRIBE';
  HttpParser.METHODS[24] = 'PATCH';
  HttpParser.METHODS[25] = 'PURGE';
}

HttpParser.prototype.isComplete = function() {
  return this._complete;
};

HttpParser.prototype.parse = function(chunk) {
  var consumed = this._parser.execute(chunk, 0, chunk.length);

  if (typeof consumed !== 'number') {
    this.error = consumed;
    this._complete = true;
    return;
  }

  if (this._complete) this.body = consumed < chunk.length ? chunk.slice(consumed) : Buffer$4.alloc(0);
};

var http_parser = HttpParser;

var TOKEN = /([!#\$%&'\*\+\-\.\^_`\|~0-9A-Za-z]+)/,
  NOTOKEN = /([^!#\$%&'\*\+\-\.\^_`\|~0-9A-Za-z])/g,
  QUOTED = /"((?:\\[\x00-\x7f]|[^\x00-\x08\x0a-\x1f\x7f"])*)"/,
  PARAM = new RegExp(TOKEN.source + '(?:=(?:' + TOKEN.source + '|' + QUOTED.source + '))?'),
  EXT = new RegExp(TOKEN.source + '(?: *; *' + PARAM.source + ')*', 'g'),
  EXT_LIST = new RegExp('^' + EXT.source + '(?: *, *' + EXT.source + ')*$'),
  NUMBER = /^-?(0|[1-9][0-9]*)(\.[0-9]+)?$/;

var hasOwnProperty = Object.prototype.hasOwnProperty;

var Parser = {
  parseHeader: function(header) {
    var offers = new Offers();
    if (header === '' || header === undefined) return offers;

    if (!EXT_LIST.test(header)) throw new SyntaxError('Invalid Sec-WebSocket-Extensions header: ' + header);

    var values = header.match(EXT);

    values.forEach(function(value) {
      var params = value.match(new RegExp(PARAM.source, 'g')),
        name = params.shift(),
        offer = {};

      params.forEach(function(param) {
        var args = param.match(PARAM),
          key = args[1],
          data;

        if (args[2] !== undefined) {
          data = args[2];
        } else if (args[3] !== undefined) {
          data = args[3].replace(/\\/g, '');
        } else {
          data = true;
        }
        if (NUMBER.test(data)) data = parseFloat(data);

        if (hasOwnProperty.call(offer, key)) {
          offer[key] = [].concat(offer[key]);
          offer[key].push(data);
        } else {
          offer[key] = data;
        }
      }, this);
      offers.push(name, offer);
    }, this);

    return offers;
  },

  serializeParams: function(name, params) {
    var values = [];

    var print = function(key, value) {
      if (value instanceof Array) {
        value.forEach(function(v) {
          print(key, v);
        });
      } else if (value === true) {
        values.push(key);
      } else if (typeof value === 'number') {
        values.push(key + '=' + value);
      } else if (NOTOKEN.test(value)) {
        values.push(key + '="' + value.replace(/"/g, '\\"') + '"');
      } else {
        values.push(key + '=' + value);
      }
    };

    for (var key in params) print(key, params[key]);

    return [name].concat(values).join('; ');
  }
};

var Offers = function() {
  this._byName = {};
  this._inOrder = [];
};

Offers.prototype.push = function(name, params) {
  if (!hasOwnProperty.call(this._byName, name)) this._byName[name] = [];

  this._byName[name].push(params);
  this._inOrder.push({ name: name, params: params });
};

Offers.prototype.eachOffer = function(callback, context) {
  var list = this._inOrder;
  for (var i = 0, n = list.length; i < n; i++) callback.call(context, list[i].name, list[i].params);
};

Offers.prototype.byName = function(name) {
  return this._byName[name] || [];
};

Offers.prototype.toArray = function() {
  return this._inOrder.slice();
};

var parser = Parser;

var RingBuffer = function(bufferSize) {
  this._bufferSize = bufferSize;
  this.clear();
};

RingBuffer.prototype.clear = function() {
  this._buffer = new Array(this._bufferSize);
  this._ringOffset = 0;
  this._ringSize = this._bufferSize;
  this._head = 0;
  this._tail = 0;
  this.length = 0;
};

RingBuffer.prototype.push = function(value) {
  var expandBuffer = false,
    expandRing = false;

  if (this._ringSize < this._bufferSize) {
    expandBuffer = this._tail === 0;
  } else if (this._ringOffset === this._ringSize) {
    expandBuffer = true;
    expandRing = this._tail === 0;
  }

  if (expandBuffer) {
    this._tail = this._bufferSize;
    this._buffer = this._buffer.concat(new Array(this._bufferSize));
    this._bufferSize = this._buffer.length;

    if (expandRing) this._ringSize = this._bufferSize;
  }

  this._buffer[this._tail] = value;
  this.length += 1;
  if (this._tail < this._ringSize) this._ringOffset += 1;
  this._tail = (this._tail + 1) % this._bufferSize;
};

RingBuffer.prototype.peek = function() {
  if (this.length === 0) return void 0;
  return this._buffer[this._head];
};

RingBuffer.prototype.shift = function() {
  if (this.length === 0) return void 0;

  var value = this._buffer[this._head];
  this._buffer[this._head] = void 0;
  this.length -= 1;
  this._ringOffset -= 1;

  if (this._ringOffset === 0 && this.length > 0) {
    this._head = this._ringSize;
    this._ringOffset = this.length;
    this._ringSize = this._bufferSize;
  } else {
    this._head = (this._head + 1) % this._ringSize;
  }
  return value;
};

var ring_buffer = RingBuffer;

var Functor = function(session, method) {
  this._session = session;
  this._method = method;
  this._queue = new ring_buffer(Functor.QUEUE_SIZE);
  this._stopped = false;
  this.pending = 0;
};

Functor.QUEUE_SIZE = 8;

Functor.prototype.call = function(error, message, callback, context) {
  if (this._stopped) return;

  var record = { error: error, message: message, callback: callback, context: context, done: false },
    called = false,
    self = this;

  this._queue.push(record);

  if (record.error) {
    record.done = true;
    this._stop();
    return this._flushQueue();
  }

  var handler = function(err, msg) {
    if (!(called ^ (called = true))) return;

    if (err) {
      self._stop();
      record.error = err;
      record.message = null;
    } else {
      record.message = msg;
    }

    record.done = true;
    self._flushQueue();
  };

  try {
    this._session[this._method](message, handler);
  } catch (err) {
    handler(err);
  }
};

Functor.prototype._stop = function() {
  this.pending = this._queue.length;
  this._stopped = true;
};

Functor.prototype._flushQueue = function() {
  var queue = this._queue,
    record;

  while (queue.length > 0 && queue.peek().done) {
    record = queue.shift();
    if (record.error) {
      this.pending = 0;
      queue.clear();
    } else {
      this.pending -= 1;
    }
    record.callback.call(record.context, record.error, record.message);
  }
};

var functor = Functor;

var Pledge = function() {
  this._complete = false;
  this._callbacks = new ring_buffer(Pledge.QUEUE_SIZE);
};

Pledge.QUEUE_SIZE = 4;

Pledge.all = function(list) {
  var pledge = new Pledge(),
    pending = list.length,
    n = pending;

  if (pending === 0) pledge.done();

  while (n--)
    list[n].then(function() {
      pending -= 1;
      if (pending === 0) pledge.done();
    });
  return pledge;
};

Pledge.prototype.then = function(callback) {
  if (this._complete) callback();
  else this._callbacks.push(callback);
};

Pledge.prototype.done = function() {
  this._complete = true;
  var callbacks = this._callbacks,
    callback;
  while ((callback = callbacks.shift())) callback();
};

var pledge = Pledge;

var Cell = function(tuple) {
  this._ext = tuple[0];
  this._session = tuple[1];

  this._functors = {
    incoming: new functor(this._session, 'processIncomingMessage'),
    outgoing: new functor(this._session, 'processOutgoingMessage')
  };
};

Cell.prototype.pending = function(direction) {
  var functor = this._functors[direction];
  if (!functor._stopped) functor.pending += 1;
};

Cell.prototype.incoming = function(error, message, callback, context) {
  this._exec('incoming', error, message, callback, context);
};

Cell.prototype.outgoing = function(error, message, callback, context) {
  this._exec('outgoing', error, message, callback, context);
};

Cell.prototype.close = function() {
  this._closed = this._closed || new pledge();
  this._doClose();
  return this._closed;
};

Cell.prototype._exec = function(direction, error, message, callback, context) {
  this._functors[direction].call(
    error,
    message,
    function(err, msg) {
      if (err) err.message = this._ext.name + ': ' + err.message;
      callback.call(context, err, msg);
      this._doClose();
    },
    this
  );
};

Cell.prototype._doClose = function() {
  var fin = this._functors.incoming,
    fout = this._functors.outgoing;

  if (!this._closed || fin.pending + fout.pending !== 0) return;
  if (this._session) this._session.close();
  this._session = null;
  this._closed.done();
};

var cell = Cell;

var Pipeline = function(sessions) {
  this._cells = sessions.map(function(session) {
    return new cell(session);
  });
  this._stopped = { incoming: false, outgoing: false };
};

Pipeline.prototype.processIncomingMessage = function(message, callback, context) {
  if (this._stopped.incoming) return;
  this._loop('incoming', this._cells.length - 1, -1, -1, message, callback, context);
};

Pipeline.prototype.processOutgoingMessage = function(message, callback, context) {
  if (this._stopped.outgoing) return;
  this._loop('outgoing', 0, this._cells.length, 1, message, callback, context);
};

Pipeline.prototype.close = function(callback, context) {
  this._stopped = { incoming: true, outgoing: true };

  var closed = this._cells.map(function(a) {
    return a.close();
  });
  if (callback)
    pledge.all(closed).then(function() {
      callback.call(context);
    });
};

Pipeline.prototype._loop = function(direction, start, end, step, message, callback, context) {
  var cells = this._cells,
    n = cells.length,
    self = this;

  while (n--) cells[n].pending(direction);

  var pipe = function(index, error, msg) {
    if (index === end) return callback.call(context, error, msg);

    cells[index][direction](error, msg, function(err, m) {
      if (err) self._stopped[direction] = true;
      pipe(
        index + step,
        err,
        m
      );
    });
  };
  pipe(
    start,
    null,
    message
  );
};

var pipeline = Pipeline;

var Extensions = function() {
  this._rsv1 = this._rsv2 = this._rsv3 = null;

  this._byName = {};
  this._inOrder = [];
  this._sessions = [];
  this._index = {};
};

Extensions.MESSAGE_OPCODES = [1, 2];

var instance$1 = {
  add: function(ext) {
    if (typeof ext.name !== 'string') throw new TypeError('extension.name must be a string');
    if (ext.type !== 'permessage') throw new TypeError('extension.type must be "permessage"');

    if (typeof ext.rsv1 !== 'boolean') throw new TypeError('extension.rsv1 must be true or false');
    if (typeof ext.rsv2 !== 'boolean') throw new TypeError('extension.rsv2 must be true or false');
    if (typeof ext.rsv3 !== 'boolean') throw new TypeError('extension.rsv3 must be true or false');

    if (this._byName.hasOwnProperty(ext.name))
      throw new TypeError('An extension with name "' + ext.name + '" is already registered');

    this._byName[ext.name] = ext;
    this._inOrder.push(ext);
  },

  generateOffer: function() {
    var sessions = [],
      offer = [],
      index = {};

    this._inOrder.forEach(function(ext) {
      var session = ext.createClientSession();
      if (!session) return;

      var record = [ext, session];
      sessions.push(record);
      index[ext.name] = record;

      var offers = session.generateOffer();
      offers = offers ? [].concat(offers) : [];

      offers.forEach(function(off) {
        offer.push(parser.serializeParams(ext.name, off));
      }, this);
    }, this);

    this._sessions = sessions;
    this._index = index;

    return offer.length > 0 ? offer.join(', ') : null;
  },

  activate: function(header) {
    var responses = parser.parseHeader(header),
      sessions = [];

    responses.eachOffer(function(name, params) {
      var record = this._index[name];

      if (!record) throw new Error('Server sent an extension response for unknown extension "' + name + '"');

      var ext = record[0],
        session = record[1],
        reserved = this._reserved(ext);

      if (reserved)
        throw new Error(
          'Server sent two extension responses that use the RSV' +
            reserved[0] +
            ' bit: "' +
            reserved[1] +
            '" and "' +
            ext.name +
            '"'
        );

      if (session.activate(params) !== true)
        throw new Error('Server sent unacceptable extension parameters: ' + parser.serializeParams(name, params));

      this._reserve(ext);
      sessions.push(record);
    }, this);

    this._sessions = sessions;
    this._pipeline = new pipeline(sessions);
  },

  generateResponse: function(header) {
    var sessions = [],
      response = [],
      offers = parser.parseHeader(header);

    this._inOrder.forEach(function(ext) {
      var offer = offers.byName(ext.name);
      if (offer.length === 0 || this._reserved(ext)) return;

      var session = ext.createServerSession(offer);
      if (!session) return;

      this._reserve(ext);
      sessions.push([ext, session]);
      response.push(parser.serializeParams(ext.name, session.generateResponse()));
    }, this);

    this._sessions = sessions;
    this._pipeline = new pipeline(sessions);

    return response.length > 0 ? response.join(', ') : null;
  },

  validFrameRsv: function(frame) {
    var allowed = { rsv1: false, rsv2: false, rsv3: false },
      ext;

    if (Extensions.MESSAGE_OPCODES.indexOf(frame.opcode) >= 0) {
      for (var i = 0, n = this._sessions.length; i < n; i++) {
        ext = this._sessions[i][0];
        allowed.rsv1 = allowed.rsv1 || ext.rsv1;
        allowed.rsv2 = allowed.rsv2 || ext.rsv2;
        allowed.rsv3 = allowed.rsv3 || ext.rsv3;
      }
    }

    return (allowed.rsv1 || !frame.rsv1) && (allowed.rsv2 || !frame.rsv2) && (allowed.rsv3 || !frame.rsv3);
  },

  processIncomingMessage: function(message, callback, context) {
    this._pipeline.processIncomingMessage(message, callback, context);
  },

  processOutgoingMessage: function(message, callback, context) {
    this._pipeline.processOutgoingMessage(message, callback, context);
  },

  close: function(callback, context) {
    if (!this._pipeline) return callback.call(context);
    this._pipeline.close(callback, context);
  },

  _reserve: function(ext) {
    this._rsv1 = this._rsv1 || (ext.rsv1 && ext.name);
    this._rsv2 = this._rsv2 || (ext.rsv2 && ext.name);
    this._rsv3 = this._rsv3 || (ext.rsv3 && ext.name);
  },

  _reserved: function(ext) {
    if (this._rsv1 && ext.rsv1) return [1, this._rsv1];
    if (this._rsv2 && ext.rsv2) return [2, this._rsv2];
    if (this._rsv3 && ext.rsv3) return [3, this._rsv3];
    return false;
  }
};

for (var key$1 in instance$1) Extensions.prototype[key$1] = instance$1[key$1];

var websocket_extensions = Extensions;

var Frame = function() {};

var instance$2 = {
  final: false,
  rsv1: false,
  rsv2: false,
  rsv3: false,
  opcode: null,
  masked: false,
  maskingKey: null,
  lengthBytes: 1,
  length: 0,
  payload: null
};

for (var key$2 in instance$2) Frame.prototype[key$2] = instance$2[key$2];

var frame = Frame;

var Buffer$5 = safeBuffer.Buffer;

var Message = function() {
  this.rsv1 = false;
  this.rsv2 = false;
  this.rsv3 = false;
  this.opcode = null;
  this.length = 0;
  this._chunks = [];
};

var instance$3 = {
  read: function() {
    return (this.data = this.data || Buffer$5.concat(this._chunks, this.length));
  },

  pushFrame: function(frame) {
    this.rsv1 = this.rsv1 || frame.rsv1;
    this.rsv2 = this.rsv2 || frame.rsv2;
    this.rsv3 = this.rsv3 || frame.rsv3;

    if (this.opcode === null) this.opcode = frame.opcode;

    this._chunks.push(frame.payload);
    this.length += frame.length;
  }
};

for (var key$3 in instance$3) Message.prototype[key$3] = instance$3[key$3];

var message = Message;

var Buffer$6 = safeBuffer.Buffer;

var Hybi = function(request, url, options) {
  base.apply(this, arguments);

  this._extensions = new websocket_extensions();
  this._stage = 0;
  this._masking = this._options.masking;
  this._protocols = this._options.protocols || [];
  this._requireMasking = this._options.requireMasking;
  this._pingCallbacks = {};

  if (typeof this._protocols === 'string') this._protocols = this._protocols.split(/ *, */);

  if (!this._request) return;

  var protos = this._request.headers['sec-websocket-protocol'],
    supported = this._protocols;

  if (protos !== undefined) {
    if (typeof protos === 'string') protos = protos.split(/ *, */);
    this.protocol = protos.filter(function(p) {
      return supported.indexOf(p) >= 0;
    })[0];
  }

  this.version = 'hybi-' + Hybi.VERSION;
};
util__default['default'].inherits(Hybi, base);

Hybi.VERSION = '13';

Hybi.mask = function(payload, mask, offset) {
  if (!mask || mask.length === 0) return payload;
  offset = offset || 0;

  for (var i = 0, n = payload.length - offset; i < n; i++) {
    payload[offset + i] = payload[offset + i] ^ mask[i % 4];
  }
  return payload;
};

Hybi.generateAccept = function(key) {
  var sha1 = crypto__default['default'].createHash('sha1');
  sha1.update(key + Hybi.GUID);
  return sha1.digest('base64');
};

Hybi.GUID = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';

var instance$4 = {
  FIN: 0x80,
  MASK: 0x80,
  RSV1: 0x40,
  RSV2: 0x20,
  RSV3: 0x10,
  OPCODE: 0x0f,
  LENGTH: 0x7f,

  OPCODES: {
    continuation: 0,
    text: 1,
    binary: 2,
    close: 8,
    ping: 9,
    pong: 10
  },

  OPCODE_CODES: [0, 1, 2, 8, 9, 10],
  MESSAGE_OPCODES: [0, 1, 2],
  OPENING_OPCODES: [1, 2],

  ERRORS: {
    normal_closure: 1000,
    going_away: 1001,
    protocol_error: 1002,
    unacceptable: 1003,
    encoding_error: 1007,
    policy_violation: 1008,
    too_large: 1009,
    extension_error: 1010,
    unexpected_condition: 1011
  },

  ERROR_CODES: [1000, 1001, 1002, 1003, 1007, 1008, 1009, 1010, 1011],
  DEFAULT_ERROR_CODE: 1000,
  MIN_RESERVED_ERROR: 3000,
  MAX_RESERVED_ERROR: 4999,

  // http://www.w3.org/International/questions/qa-forms-utf-8.en.php
  UTF8_MATCH: /^([\x00-\x7F]|[\xC2-\xDF][\x80-\xBF]|\xE0[\xA0-\xBF][\x80-\xBF]|[\xE1-\xEC\xEE\xEF][\x80-\xBF]{2}|\xED[\x80-\x9F][\x80-\xBF]|\xF0[\x90-\xBF][\x80-\xBF]{2}|[\xF1-\xF3][\x80-\xBF]{3}|\xF4[\x80-\x8F][\x80-\xBF]{2})*$/,

  addExtension: function(extension) {
    this._extensions.add(extension);
    return true;
  },

  parse: function(chunk) {
    this._reader.put(chunk);
    var buffer = true;
    while (buffer) {
      switch (this._stage) {
        case 0:
          buffer = this._reader.read(1);
          if (buffer) this._parseOpcode(buffer[0]);
          break;

        case 1:
          buffer = this._reader.read(1);
          if (buffer) this._parseLength(buffer[0]);
          break;

        case 2:
          buffer = this._reader.read(this._frame.lengthBytes);
          if (buffer) this._parseExtendedLength(buffer);
          break;

        case 3:
          buffer = this._reader.read(4);
          if (buffer) {
            this._stage = 4;
            this._frame.maskingKey = buffer;
          }
          break;

        case 4:
          buffer = this._reader.read(this._frame.length);
          if (buffer) {
            this._stage = 0;
            this._emitFrame(buffer);
          }
          break;

        default:
          buffer = null;
      }
    }
  },

  text: function(message) {
    if (this.readyState > 1) return false;
    return this.frame(message, 'text');
  },

  binary: function(message) {
    if (this.readyState > 1) return false;
    return this.frame(message, 'binary');
  },

  ping: function(message, callback) {
    if (this.readyState > 1) return false;
    message = message || '';
    if (callback) this._pingCallbacks[message] = callback;
    return this.frame(message, 'ping');
  },

  pong: function(message) {
    if (this.readyState > 1) return false;
    message = message || '';
    return this.frame(message, 'pong');
  },

  close: function(reason, code) {
    reason = reason || '';
    code = code || this.ERRORS.normal_closure;

    if (this.readyState <= 0) {
      this.readyState = 3;
      this.emit('close', new base.CloseEvent(code, reason));
      return true;
    } else if (this.readyState === 1) {
      this.readyState = 2;
      this._extensions.close(function() {
        this.frame(reason, 'close', code);
      }, this);
      return true;
    } else {
      return false;
    }
  },

  frame: function(buffer, type, code) {
    if (this.readyState <= 0) return this._queue([buffer, type, code]);
    if (this.readyState > 2) return false;

    if (buffer instanceof Array) buffer = Buffer$6.from(buffer);
    if (typeof buffer === 'number') buffer = buffer.toString();

    var message$1 = new message(),
      isText = typeof buffer === 'string',
      payload,
      copy;

    message$1.rsv1 = message$1.rsv2 = message$1.rsv3 = false;
    message$1.opcode = this.OPCODES[type || (isText ? 'text' : 'binary')];

    payload = isText ? Buffer$6.from(buffer, 'utf8') : buffer;

    if (code) {
      copy = payload;
      payload = Buffer$6.allocUnsafe(2 + copy.length);
      payload.writeUInt16BE(code, 0);
      copy.copy(payload, 2);
    }
    message$1.data = payload;

    var onMessageReady = function(message) {
      var frame$1 = new frame();

      frame$1.final = true;
      frame$1.rsv1 = message.rsv1;
      frame$1.rsv2 = message.rsv2;
      frame$1.rsv3 = message.rsv3;
      frame$1.opcode = message.opcode;
      frame$1.masked = !!this._masking;
      frame$1.length = message.data.length;
      frame$1.payload = message.data;

      if (frame$1.masked) frame$1.maskingKey = crypto__default['default'].randomBytes(4);

      this._sendFrame(frame$1);
    };

    if (this.MESSAGE_OPCODES.indexOf(message$1.opcode) >= 0)
      this._extensions.processOutgoingMessage(
        message$1,
        function(error, message) {
          if (error) return this._fail('extension_error', error.message);
          onMessageReady.call(this, message);
        },
        this
      );
    else onMessageReady.call(this, message$1);

    return true;
  },

  _sendFrame: function(frame) {
    var length = frame.length,
      header = length <= 125 ? 2 : length <= 65535 ? 4 : 10,
      offset = header + (frame.masked ? 4 : 0),
      buffer = Buffer$6.allocUnsafe(offset + length),
      masked = frame.masked ? this.MASK : 0;

    buffer[0] =
      (frame.final ? this.FIN : 0) |
      (frame.rsv1 ? this.RSV1 : 0) |
      (frame.rsv2 ? this.RSV2 : 0) |
      (frame.rsv3 ? this.RSV3 : 0) |
      frame.opcode;

    if (length <= 125) {
      buffer[1] = masked | length;
    } else if (length <= 65535) {
      buffer[1] = masked | 126;
      buffer.writeUInt16BE(length, 2);
    } else {
      buffer[1] = masked | 127;
      buffer.writeUInt32BE(Math.floor(length / 0x100000000), 2);
      buffer.writeUInt32BE(length % 0x100000000, 6);
    }

    frame.payload.copy(buffer, offset);

    if (frame.masked) {
      frame.maskingKey.copy(buffer, header);
      Hybi.mask(buffer, frame.maskingKey, offset);
    }

    this._write(buffer);
  },

  _handshakeResponse: function() {
    var secKey = this._request.headers['sec-websocket-key'],
      version = this._request.headers['sec-websocket-version'];

    if (version !== Hybi.VERSION) throw new Error('Unsupported WebSocket version: ' + version);

    if (typeof secKey !== 'string') throw new Error('Missing handshake request header: Sec-WebSocket-Key');

    this._headers.set('Upgrade', 'websocket');
    this._headers.set('Connection', 'Upgrade');
    this._headers.set('Sec-WebSocket-Accept', Hybi.generateAccept(secKey));

    if (this.protocol) this._headers.set('Sec-WebSocket-Protocol', this.protocol);

    var extensions = this._extensions.generateResponse(this._request.headers['sec-websocket-extensions']);
    if (extensions) this._headers.set('Sec-WebSocket-Extensions', extensions);

    var start = 'HTTP/1.1 101 Switching Protocols',
      headers = [start, this._headers.toString(), ''];

    return Buffer$6.from(headers.join('\r\n'), 'utf8');
  },

  _shutdown: function(code, reason, error) {
    delete this._frame;
    delete this._message;
    this._stage = 5;

    var sendCloseFrame = this.readyState === 1;
    this.readyState = 2;

    this._extensions.close(function() {
      if (sendCloseFrame) this.frame(reason, 'close', code);
      this.readyState = 3;
      if (error) this.emit('error', new Error(reason));
      this.emit('close', new base.CloseEvent(code, reason));
    }, this);
  },

  _fail: function(type, message) {
    if (this.readyState > 1) return;
    this._shutdown(this.ERRORS[type], message, true);
  },

  _parseOpcode: function(octet) {
    var rsvs = [this.RSV1, this.RSV2, this.RSV3].map(function(rsv) {
      return (octet & rsv) === rsv;
    });

    var frame$1 = (this._frame = new frame());

    frame$1.final = (octet & this.FIN) === this.FIN;
    frame$1.rsv1 = rsvs[0];
    frame$1.rsv2 = rsvs[1];
    frame$1.rsv3 = rsvs[2];
    frame$1.opcode = octet & this.OPCODE;

    this._stage = 1;

    if (!this._extensions.validFrameRsv(frame$1))
      return this._fail(
        'protocol_error',
        'One or more reserved bits are on: reserved1 = ' +
          (frame$1.rsv1 ? 1 : 0) +
          ', reserved2 = ' +
          (frame$1.rsv2 ? 1 : 0) +
          ', reserved3 = ' +
          (frame$1.rsv3 ? 1 : 0)
      );

    if (this.OPCODE_CODES.indexOf(frame$1.opcode) < 0)
      return this._fail('protocol_error', 'Unrecognized frame opcode: ' + frame$1.opcode);

    if (this.MESSAGE_OPCODES.indexOf(frame$1.opcode) < 0 && !frame$1.final)
      return this._fail('protocol_error', 'Received fragmented control frame: opcode = ' + frame$1.opcode);

    if (this._message && this.OPENING_OPCODES.indexOf(frame$1.opcode) >= 0)
      return this._fail('protocol_error', 'Received new data frame but previous continuous frame is unfinished');
  },

  _parseLength: function(octet) {
    var frame = this._frame;
    frame.masked = (octet & this.MASK) === this.MASK;
    frame.length = octet & this.LENGTH;

    if (frame.length >= 0 && frame.length <= 125) {
      this._stage = frame.masked ? 3 : 4;
      if (!this._checkFrameLength()) return;
    } else {
      this._stage = 2;
      frame.lengthBytes = frame.length === 126 ? 2 : 8;
    }

    if (this._requireMasking && !frame.masked)
      return this._fail('unacceptable', 'Received unmasked frame but masking is required');
  },

  _parseExtendedLength: function(buffer) {
    var frame = this._frame;
    frame.length = this._readUInt(buffer);

    this._stage = frame.masked ? 3 : 4;

    if (this.MESSAGE_OPCODES.indexOf(frame.opcode) < 0 && frame.length > 125)
      return this._fail('protocol_error', 'Received control frame having too long payload: ' + frame.length);

    if (!this._checkFrameLength()) return;
  },

  _checkFrameLength: function() {
    var length = this._message ? this._message.length : 0;

    if (length + this._frame.length > this._maxLength) {
      this._fail('too_large', 'WebSocket frame length too large');
      return false;
    } else {
      return true;
    }
  },

  _emitFrame: function(buffer) {
    var frame = this._frame,
      payload = (frame.payload = Hybi.mask(buffer, frame.maskingKey)),
      opcode = frame.opcode,
      message$1,
      code,
      reason,
      callbacks,
      callback;

    delete this._frame;

    if (opcode === this.OPCODES.continuation) {
      if (!this._message) return this._fail('protocol_error', 'Received unexpected continuation frame');
      this._message.pushFrame(frame);
    }

    if (opcode === this.OPCODES.text || opcode === this.OPCODES.binary) {
      this._message = new message();
      this._message.pushFrame(frame);
    }

    if (frame.final && this.MESSAGE_OPCODES.indexOf(opcode) >= 0) return this._emitMessage(this._message);

    if (opcode === this.OPCODES.close) {
      code = payload.length >= 2 ? payload.readUInt16BE(0) : null;
      reason = payload.length > 2 ? this._encode(payload.slice(2)) : null;

      if (
        !(payload.length === 0) &&
        !(code !== null && code >= this.MIN_RESERVED_ERROR && code <= this.MAX_RESERVED_ERROR) &&
        this.ERROR_CODES.indexOf(code) < 0
      )
        code = this.ERRORS.protocol_error;

      if (payload.length > 125 || (payload.length > 2 && !reason)) code = this.ERRORS.protocol_error;

      this._shutdown(code || this.DEFAULT_ERROR_CODE, reason || '');
    }

    if (opcode === this.OPCODES.ping) {
      this.frame(payload, 'pong');
      this.emit('ping', new base.PingEvent(payload.toString()));
    }

    if (opcode === this.OPCODES.pong) {
      callbacks = this._pingCallbacks;
      message$1 = this._encode(payload);
      callback = callbacks[message$1];

      delete callbacks[message$1];
      if (callback) callback();

      this.emit('pong', new base.PongEvent(payload.toString()));
    }
  },

  _emitMessage: function(message) {
    var message = this._message;
    message.read();

    delete this._message;

    this._extensions.processIncomingMessage(
      message,
      function(error, message) {
        if (error) return this._fail('extension_error', error.message);

        var payload = message.data;
        if (message.opcode === this.OPCODES.text) payload = this._encode(payload);

        if (payload === null) return this._fail('encoding_error', 'Could not decode a text frame as UTF-8');
        else this.emit('message', new base.MessageEvent(payload));
      },
      this
    );
  },

  _encode: function(buffer) {
    try {
      var string = buffer.toString('binary', 0, buffer.length);
      if (!this.UTF8_MATCH.test(string)) return null;
    } catch (e) {}
    return buffer.toString('utf8', 0, buffer.length);
  },

  _readUInt: function(buffer) {
    if (buffer.length === 2) return buffer.readUInt16BE(0);

    return buffer.readUInt32BE(0) * 0x100000000 + buffer.readUInt32BE(4);
  }
};

for (var key$4 in instance$4) Hybi.prototype[key$4] = instance$4[key$4];

var hybi = Hybi;

var Buffer$7 = safeBuffer.Buffer,
  Stream$2 = Stream__default['default'].Stream;

var PORTS = { 'ws:': 80, 'wss:': 443 };

var Proxy = function(client, origin, options) {
  this._client = client;
  this._http = new http_parser('response');
  this._origin = typeof client.url === 'object' ? client.url : url__default['default'].parse(client.url);
  this._url = typeof origin === 'object' ? origin : url__default['default'].parse(origin);
  this._options = options || {};
  this._state = 0;

  this.readable = this.writable = true;
  this._paused = false;

  this._headers = new headers();
  this._headers.set('Host', this._origin.host);
  this._headers.set('Connection', 'keep-alive');
  this._headers.set('Proxy-Connection', 'keep-alive');

  var auth = this._url.auth && Buffer$7.from(this._url.auth, 'utf8').toString('base64');
  if (auth) this._headers.set('Proxy-Authorization', 'Basic ' + auth);
};
util__default['default'].inherits(Proxy, Stream$2);

var instance$5 = {
  setHeader: function(name, value) {
    if (this._state !== 0) return false;
    this._headers.set(name, value);
    return true;
  },

  start: function() {
    if (this._state !== 0) return false;
    this._state = 1;

    var origin = this._origin,
      port = origin.port || PORTS[origin.protocol],
      start = 'CONNECT ' + origin.hostname + ':' + port + ' HTTP/1.1';

    var headers = [start, this._headers.toString(), ''];

    this.emit('data', Buffer$7.from(headers.join('\r\n'), 'utf8'));
    return true;
  },

  pause: function() {
    this._paused = true;
  },

  resume: function() {
    this._paused = false;
    this.emit('drain');
  },

  write: function(chunk) {
    if (!this.writable) return false;

    this._http.parse(chunk);
    if (!this._http.isComplete()) return !this._paused;

    this.statusCode = this._http.statusCode;
    this.headers = this._http.headers;

    if (this.statusCode === 200) {
      this.emit('connect', new base.ConnectEvent());
    } else {
      var message = "Can't establish a connection to the server at " + this._origin.href;
      this.emit('error', new Error(message));
    }
    this.end();
    return !this._paused;
  },

  end: function(chunk) {
    if (!this.writable) return;
    if (chunk !== undefined) this.write(chunk);
    this.readable = this.writable = false;
    this.emit('close');
    this.emit('end');
  },

  destroy: function() {
    this.end();
  }
};

for (var key$5 in instance$5) Proxy.prototype[key$5] = instance$5[key$5];

var proxy = Proxy;

var Buffer$8 = safeBuffer.Buffer;

var Client = function(_url, options) {
  this.version = 'hybi-' + hybi.VERSION;
  hybi.call(this, null, _url, options);

  this.readyState = -1;
  this._key = Client.generateKey();
  this._accept = hybi.generateAccept(this._key);
  this._http = new http_parser('response');

  var uri = url__default['default'].parse(this.url),
    auth = uri.auth && Buffer$8.from(uri.auth, 'utf8').toString('base64');

  if (this.VALID_PROTOCOLS.indexOf(uri.protocol) < 0) throw new Error(this.url + ' is not a valid WebSocket URL');

  this._pathname = (uri.pathname || '/') + (uri.search || '');

  this._headers.set('Host', uri.host);
  this._headers.set('Upgrade', 'websocket');
  this._headers.set('Connection', 'Upgrade');
  this._headers.set('Sec-WebSocket-Key', this._key);
  this._headers.set('Sec-WebSocket-Version', hybi.VERSION);

  if (this._protocols.length > 0) this._headers.set('Sec-WebSocket-Protocol', this._protocols.join(', '));

  if (auth) this._headers.set('Authorization', 'Basic ' + auth);
};
util__default['default'].inherits(Client, hybi);

Client.generateKey = function() {
  return crypto__default['default'].randomBytes(16).toString('base64');
};

var instance$6 = {
  VALID_PROTOCOLS: ['ws:', 'wss:'],

  proxy: function(origin, options) {
    return new proxy(this, origin, options);
  },

  start: function() {
    if (this.readyState !== -1) return false;
    this._write(this._handshakeRequest());
    this.readyState = 0;
    return true;
  },

  parse: function(chunk) {
    if (this.readyState === 3) return;
    if (this.readyState > 0) return hybi.prototype.parse.call(this, chunk);

    this._http.parse(chunk);
    if (!this._http.isComplete()) return;

    this._validateHandshake();
    if (this.readyState === 3) return;

    this._open();
    this.parse(this._http.body);
  },

  _handshakeRequest: function() {
    var extensions = this._extensions.generateOffer();
    if (extensions) this._headers.set('Sec-WebSocket-Extensions', extensions);

    var start = 'GET ' + this._pathname + ' HTTP/1.1',
      headers = [start, this._headers.toString(), ''];

    return Buffer$8.from(headers.join('\r\n'), 'utf8');
  },

  _failHandshake: function(message) {
    message = 'Error during WebSocket handshake: ' + message;
    this.readyState = 3;
    this.emit('error', new Error(message));
    this.emit('close', new base.CloseEvent(this.ERRORS.protocol_error, message));
  },

  _validateHandshake: function() {
    this.statusCode = this._http.statusCode;
    this.headers = this._http.headers;

    if (this._http.error) return this._failHandshake(this._http.error.message);

    if (this._http.statusCode !== 101) return this._failHandshake('Unexpected response code: ' + this._http.statusCode);

    var headers = this._http.headers,
      upgrade = headers['upgrade'] || '',
      connection = headers['connection'] || '',
      accept = headers['sec-websocket-accept'] || '',
      protocol = headers['sec-websocket-protocol'] || '';

    if (upgrade === '') return this._failHandshake("'Upgrade' header is missing");
    if (upgrade.toLowerCase() !== 'websocket') return this._failHandshake("'Upgrade' header value is not 'WebSocket'");

    if (connection === '') return this._failHandshake("'Connection' header is missing");
    if (connection.toLowerCase() !== 'upgrade')
      return this._failHandshake("'Connection' header value is not 'Upgrade'");

    if (accept !== this._accept) return this._failHandshake('Sec-WebSocket-Accept mismatch');

    this.protocol = null;

    if (protocol !== '') {
      if (this._protocols.indexOf(protocol) < 0) return this._failHandshake('Sec-WebSocket-Protocol mismatch');
      else this.protocol = protocol;
    }

    try {
      this._extensions.activate(this.headers['sec-websocket-extensions']);
    } catch (e) {
      return this._failHandshake(e.message);
    }
  }
};

for (var key$6 in instance$6) Client.prototype[key$6] = instance$6[key$6];

var client = Client;

var Buffer$9 = safeBuffer.Buffer;

var Draft75 = function(request, url, options) {
  base.apply(this, arguments);
  this._stage = 0;
  this.version = 'hixie-75';

  this._headers.set('Upgrade', 'WebSocket');
  this._headers.set('Connection', 'Upgrade');
  this._headers.set('WebSocket-Origin', this._request.headers.origin);
  this._headers.set('WebSocket-Location', this.url);
};
util__default['default'].inherits(Draft75, base);

var instance$7 = {
  close: function() {
    if (this.readyState === 3) return false;
    this.readyState = 3;
    this.emit('close', new base.CloseEvent(null, null));
    return true;
  },

  parse: function(chunk) {
    if (this.readyState > 1) return;

    this._reader.put(chunk);

    this._reader.eachByte(function(octet) {
      var message;

      switch (this._stage) {
        case -1:
          this._body.push(octet);
          this._sendHandshakeBody();
          break;

        case 0:
          this._parseLeadingByte(octet);
          break;

        case 1:
          this._length = (octet & 0x7f) + 128 * this._length;

          if (this._closing && this._length === 0) {
            return this.close();
          } else if ((octet & 0x80) !== 0x80) {
            if (this._length === 0) {
              this._stage = 0;
            } else {
              this._skipped = 0;
              this._stage = 2;
            }
          }
          break;

        case 2:
          if (octet === 0xff) {
            this._stage = 0;
            message = Buffer$9.from(this._buffer).toString('utf8', 0, this._buffer.length);
            this.emit('message', new base.MessageEvent(message));
          } else {
            if (this._length) {
              this._skipped += 1;
              if (this._skipped === this._length) this._stage = 0;
            } else {
              this._buffer.push(octet);
              if (this._buffer.length > this._maxLength) return this.close();
            }
          }
          break;
      }
    }, this);
  },

  frame: function(buffer) {
    if (this.readyState === 0) return this._queue([buffer]);
    if (this.readyState > 1) return false;

    if (typeof buffer !== 'string') buffer = buffer.toString();

    var length = Buffer$9.byteLength(buffer),
      frame = Buffer$9.allocUnsafe(length + 2);

    frame[0] = 0x00;
    frame.write(buffer, 1);
    frame[frame.length - 1] = 0xff;

    this._write(frame);
    return true;
  },

  _handshakeResponse: function() {
    var start = 'HTTP/1.1 101 Web Socket Protocol Handshake',
      headers = [start, this._headers.toString(), ''];

    return Buffer$9.from(headers.join('\r\n'), 'utf8');
  },

  _parseLeadingByte: function(octet) {
    if ((octet & 0x80) === 0x80) {
      this._length = 0;
      this._stage = 1;
    } else {
      delete this._length;
      delete this._skipped;
      this._buffer = [];
      this._stage = 2;
    }
  }
};

for (var key$7 in instance$7) Draft75.prototype[key$7] = instance$7[key$7];

var draft75 = Draft75;

var Buffer$a = safeBuffer.Buffer;

var numberFromKey = function(key) {
  return parseInt((key.match(/[0-9]/g) || []).join(''), 10);
};

var spacesInKey = function(key) {
  return (key.match(/ /g) || []).length;
};

var Draft76 = function(request, url, options) {
  draft75.apply(this, arguments);
  this._stage = -1;
  this._body = [];
  this.version = 'hixie-76';

  this._headers.clear();

  this._headers.set('Upgrade', 'WebSocket');
  this._headers.set('Connection', 'Upgrade');
  this._headers.set('Sec-WebSocket-Origin', this._request.headers.origin);
  this._headers.set('Sec-WebSocket-Location', this.url);
};
util__default['default'].inherits(Draft76, draft75);

var instance$8 = {
  BODY_SIZE: 8,

  start: function() {
    if (!draft75.prototype.start.call(this)) return false;
    this._started = true;
    this._sendHandshakeBody();
    return true;
  },

  close: function() {
    if (this.readyState === 3) return false;
    if (this.readyState === 1) this._write(Buffer$a.from([0xff, 0x00]));
    this.readyState = 3;
    this.emit('close', new base.CloseEvent(null, null));
    return true;
  },

  _handshakeResponse: function() {
    var headers = this._request.headers,
      key1 = headers['sec-websocket-key1'],
      key2 = headers['sec-websocket-key2'];

    if (!key1) throw new Error('Missing required header: Sec-WebSocket-Key1');
    if (!key2) throw new Error('Missing required header: Sec-WebSocket-Key2');

    var number1 = numberFromKey(key1),
      spaces1 = spacesInKey(key1),
      number2 = numberFromKey(key2),
      spaces2 = spacesInKey(key2);

    if (number1 % spaces1 !== 0 || number2 % spaces2 !== 0)
      throw new Error('Client sent invalid Sec-WebSocket-Key headers');

    this._keyValues = [number1 / spaces1, number2 / spaces2];

    var start = 'HTTP/1.1 101 WebSocket Protocol Handshake',
      headers = [start, this._headers.toString(), ''];

    return Buffer$a.from(headers.join('\r\n'), 'binary');
  },

  _handshakeSignature: function() {
    if (this._body.length < this.BODY_SIZE) return null;

    var md5 = crypto__default['default'].createHash('md5'),
      buffer = Buffer$a.allocUnsafe(8 + this.BODY_SIZE);

    buffer.writeUInt32BE(this._keyValues[0], 0);
    buffer.writeUInt32BE(this._keyValues[1], 4);
    Buffer$a.from(this._body).copy(buffer, 8, 0, this.BODY_SIZE);

    md5.update(buffer);
    return Buffer$a.from(md5.digest('binary'), 'binary');
  },

  _sendHandshakeBody: function() {
    if (!this._started) return;
    var signature = this._handshakeSignature();
    if (!signature) return;

    this._write(signature);
    this._stage = 0;
    this._open();

    if (this._body.length > this.BODY_SIZE) this.parse(this._body.slice(this.BODY_SIZE));
  },

  _parseLeadingByte: function(octet) {
    if (octet !== 0xff) return draft75.prototype._parseLeadingByte.call(this, octet);

    this._closing = true;
    this._length = 0;
    this._stage = 1;
  }
};

for (var key$8 in instance$8) Draft76.prototype[key$8] = instance$8[key$8];

var draft76 = Draft76;

var Server = function(options) {
  base.call(this, null, null, options);
  this._http = new http_parser('request');
};
util__default['default'].inherits(Server, base);

var instance$9 = {
  EVENTS: ['open', 'message', 'error', 'close'],

  _bindEventListeners: function() {
    this.messages.on('error', function() {});
    this.on('error', function() {});
  },

  parse: function(chunk) {
    if (this._delegate) return this._delegate.parse(chunk);

    this._http.parse(chunk);
    if (!this._http.isComplete()) return;

    this.method = this._http.method;
    this.url = this._http.url;
    this.headers = this._http.headers;
    this.body = this._http.body;

    var self = this;
    this._delegate = Server.http(this, this._options);
    this._delegate.messages = this.messages;
    this._delegate.io = this.io;
    this._open();

    this.EVENTS.forEach(function(event) {
      this._delegate.on(event, function(e) {
        self.emit(event, e);
      });
    }, this);

    this.protocol = this._delegate.protocol;
    this.version = this._delegate.version;

    this.parse(this._http.body);
    this.emit('connect', new base.ConnectEvent());
  },

  _open: function() {
    this.__queue.forEach(function(msg) {
      this._delegate[msg[0]].apply(this._delegate, msg[1]);
    }, this);
    this.__queue = [];
  }
};

['addExtension', 'setHeader', 'start', 'frame', 'text', 'binary', 'ping', 'close'].forEach(function(method) {
  instance$9[method] = function() {
    if (this._delegate) {
      return this._delegate[method].apply(this._delegate, arguments);
    } else {
      this.__queue.push([method, arguments]);
      return true;
    }
  };
});

for (var key$9 in instance$9) Server.prototype[key$9] = instance$9[key$9];

Server.isSecureRequest = function(request) {
  if (request.connection && request.connection.authorized !== undefined) return true;
  if (request.socket && request.socket.secure) return true;

  var headers = request.headers;
  if (!headers) return false;
  if (headers['https'] === 'on') return true;
  if (headers['x-forwarded-ssl'] === 'on') return true;
  if (headers['x-forwarded-scheme'] === 'https') return true;
  if (headers['x-forwarded-proto'] === 'https') return true;

  return false;
};

Server.determineUrl = function(request) {
  var scheme = this.isSecureRequest(request) ? 'wss:' : 'ws:';
  return scheme + '//' + request.headers.host + request.url;
};

Server.http = function(request, options) {
  options = options || {};
  if (options.requireMasking === undefined) options.requireMasking = true;

  var headers = request.headers,
    version = headers['sec-websocket-version'],
    key = headers['sec-websocket-key'],
    key1 = headers['sec-websocket-key1'],
    key2 = headers['sec-websocket-key2'],
    url = this.determineUrl(request);

  if (version || key) return new hybi(request, url, options);
  else if (key1 || key2) return new draft76(request, url, options);
  else return new draft75(request, url, options);
};

var server = Server;

// Protocol references:
//
// * http://tools.ietf.org/html/draft-hixie-thewebsocketprotocol-75
// * http://tools.ietf.org/html/draft-hixie-thewebsocketprotocol-76
// * http://tools.ietf.org/html/draft-ietf-hybi-thewebsocketprotocol-17

var Driver = {
  client: function(url, options) {
    options = options || {};
    if (options.masking === undefined) options.masking = true;
    return new client(url, options);
  },

  server: function(options) {
    options = options || {};
    if (options.requireMasking === undefined) options.requireMasking = true;
    return new server(options);
  },

  http: function() {
    return server.http.apply(server, arguments);
  },

  isSecureRequest: function(request) {
    return server.isSecureRequest(request);
  },

  isWebSocket: function(request) {
    return base.isWebSocket(request);
  },

  validateOptions: function(options, validKeys) {
    base.validateOptions(options, validKeys);
  }
};

var driver = Driver;

exports.asap_1 = asap_1;
exports.cookie = cookie;
exports.csprng = csprng;
exports.driver = driver;
exports.headers = headers;
exports.raw = raw;
exports.safeBuffer = safeBuffer;
exports.tunnelAgent = tunnelAgent;
//# sourceMappingURL=driver-39f7bd00.js.map
