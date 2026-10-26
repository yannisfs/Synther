import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowRight, Search, ChevronLeft, ChevronRight, ExternalLink,
  Copy, CheckCheck, Loader2, RefreshCw, AlertTriangle,
} from 'lucide-react';
import { PALETTE } from '../lib/palette';

const PAGE_SIZE = 25;

const formatDate = (s) => {
  // D1 returns "YYYY-MM-DD HH:MM:SS" UTC
  const d = new Date(s.replace(' ', 'T') + 'Z');
  if (isNaN(d)) return s;
  return d.toLocaleString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

const Admin = () => {
  const { t } = useTranslation();
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  const fetchPage = useCallback(async (p, q) => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ page: p, pageSize: PAGE_SIZE });
      if (q) params.set('q', q);
      const res = await fetch(`/api/admin/contacts?${params}`);
      if (res.status === 401 || res.status === 403) {
        setError(t('admin.accessDenied'));
        setData([]);
        setTotal(0);
        return;
      }
      if (!res.ok) {
        setError(t('admin.serverError', { status: res.status }));
        return;
      }
      const body = await res.json();
      setData(body.items || []);
      setTotal(body.total || 0);
    } catch (e) {
      setError(t('admin.networkError'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => { fetchPage(page, search); }, [page, search, fetchPage]);

  const onSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  const copyEmail = async (id, email) => {
    try {
      await navigator.clipboard.writeText(email);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1500);
    } catch { /* clipboard blocked; ignore */ }
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <>
      <section className="bg-[#FCFCFC] border-b border-slate-200 pt-12 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">{t('admin.kicker')}</span>
              <h1 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">
                {t('admin.title')}
              </h1>
              <p className="text-sm text-slate-500 mt-2">
                {t('admin.subtitle', { count: total })}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => fetchPage(page, search)}
                disabled={loading}
                className="inline-flex items-center text-xs font-bold tracking-widest uppercase text-slate-700 hover:text-slate-900 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                {t('admin.refresh')}
              </button>
              <Link to="/" className="inline-flex items-center text-xs font-bold tracking-widest uppercase text-slate-700 hover:text-slate-900 transition-colors">
                <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
                {t('admin.site')}
              </Link>
            </div>
          </div>

          <form onSubmit={onSearch} className="mt-8 max-w-xl">
            <div className="flex items-center border-b-2 border-slate-200 focus-within:border-slate-900 transition-colors">
              <Search className="w-4 h-4 text-slate-400 mr-3 flex-shrink-0" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder={t('admin.searchPlaceholder')}
                className="flex-1 border-0 focus:ring-0 px-0 py-3 text-slate-900 bg-transparent"
              />
              <button
                type="submit"
                className="text-xs font-bold tracking-widest uppercase text-slate-700 hover:text-slate-900 transition-colors py-3"
              >
                {t('admin.searchSubmit')}
              </button>
            </div>
          </form>
        </div>
      </section>

      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {error && (
            <div role="alert" className="flex items-start border-l-2 border-brand-red bg-red-50 px-4 py-3 mb-8">
              <AlertTriangle className="w-4 h-4 mr-3 mt-0.5 flex-shrink-0 text-brand-red" />
              <p className="text-sm text-slate-700">{error}</p>
            </div>
          )}

          {loading && data.length === 0 ? (
            <div className="flex items-center text-sm text-slate-500">
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {t('admin.loading')}
            </div>
          ) : data.length === 0 && !error ? (
            <div className="text-center py-20 border border-dashed border-slate-200">
              <p className="text-sm text-slate-500">
                {search ? t('admin.emptySearch') : t('admin.empty')}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto border border-slate-200">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-[10px] uppercase tracking-widest text-slate-500">
                  <tr>
                    <th className="text-left font-bold px-4 py-3">{t('admin.colWhen')}</th>
                    <th className="text-left font-bold px-4 py-3">{t('admin.colName')}</th>
                    <th className="text-left font-bold px-4 py-3">{t('admin.colEmail')}</th>
                    <th className="text-left font-bold px-4 py-3">{t('admin.colProject')}</th>
                    <th className="text-left font-bold px-4 py-3">{t('admin.colMessage')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50 align-top">
                      <td className="px-4 py-3 whitespace-nowrap text-slate-500 font-mono text-xs">
                        {formatDate(c.created_at)}
                      </td>
                      <td className="px-4 py-3 text-slate-900 font-medium">{c.name}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          <a
                            href={`mailto:${c.email}`}
                            className="text-slate-700 hover:text-brand-red transition-colors"
                          >
                            {c.email}
                          </a>
                          <button
                            onClick={() => copyEmail(c.id, c.email)}
                            className="ml-2 p-1 text-slate-400 hover:text-slate-900 transition-colors"
                            aria-label={t('admin.copyEmail')}
                            title={t('admin.copyEmail')}
                          >
                            {copiedId === c.id ? (
                              <CheckCheck className="w-4 h-4" style={{ color: PALETTE.green }} />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                          <a
                            href={`mailto:${c.email}`}
                            className="ml-1 p-1 text-slate-400 hover:text-slate-900 transition-colors"
                            aria-label={t('admin.openMail')}
                            title={t('admin.openMail')}
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600 text-xs">
                        {c.project ? (
                          <span className="inline-block border border-slate-200 px-2 py-1 rounded-sm">
                            {c.project}
                          </span>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-700 max-w-md whitespace-pre-wrap break-words">
                        {c.message}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-between">
              <div className="text-xs text-slate-500 uppercase tracking-widest">
                {t('admin.pageOf', { page, totalPages })}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1 || loading}
                  className="inline-flex items-center text-xs font-bold tracking-widest uppercase text-slate-700 hover:text-slate-900 transition-colors disabled:opacity-30"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" /> {t('admin.prev')}
                </button>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages || loading}
                  className="inline-flex items-center text-xs font-bold tracking-widest uppercase text-slate-700 hover:text-slate-900 transition-colors disabled:opacity-30"
                >
                  {t('admin.next')} <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default Admin;