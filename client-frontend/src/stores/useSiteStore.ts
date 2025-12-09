'use client'

import { PagesApi } from "@/lib/api/pages";
import { SitesApi } from "@/lib/api/sites";
import type { PageDto, SiteDto } from "@/lib/types";
import { getRequestErrorMessage } from "@/lib/utils/error";
import { create } from "zustand";

interface SiteState {
    sites: SiteDto[];
    sitesById: Record<string, SiteDto>;
    pagesBySite: Record<string, PageDto[]>;
    pageDetails: Record<string, PageDto>;
    activeSiteId?: string;
    isLoadingSites: boolean;
    pagesLoading: Record<string, boolean>;
    pageDetailsLoading: Record<string, boolean>;
    error?: string;

    setActiveSite: (siteId?: string) => void;
    fetchSites: () => Promise<SiteDto[]>;
    fetchSite: (siteId: string) => Promise<SiteDto>;
    fetchPages: (siteId: string) => Promise<PageDto[]>;
    fetchPageDetail: (siteId: string, pageId: string) => Promise<PageDto>;
}

const buildPageKey = (siteId: string, pageId: string) => `${siteId}:${pageId}`;

export const useSiteStore = create<SiteState>((set, get) => ({
    sites: [],
    sitesById: {},
    pagesBySite: {},
    pageDetails: {},
    isLoadingSites: false,
    pagesLoading: {},
    pageDetailsLoading: {},
    activeSiteId: undefined,

    setActiveSite: (siteId) => set({ activeSiteId: siteId }),

    fetchSites: async () => {
        set({ isLoadingSites: true, error: undefined });
        try {
            const sites = await SitesApi.list();
            set((state) => {
                const map = { ...state.sitesById };
                sites.forEach((site) => {
                    map[site.id] = site;
                });
                const nextActive = state.activeSiteId ?? sites[0]?.id;
                return {
                    sites,
                    sitesById: map,
                    activeSiteId: nextActive,
                };
            });
            return sites;
        } catch (error) {
            set({ error: getRequestErrorMessage(error, "Не удалось загрузить сайты") });
            throw error;
        } finally {
            set({ isLoadingSites: false });
        }
    },

    fetchSite: async (siteId) => {
        const cached = get().sitesById[siteId];
        if (cached) {
            return cached;
        }

        try {
            const site = await SitesApi.get(siteId);
            set((state) => {
                const exists = state.sites.find((s) => s.id === siteId);
                const sites = exists
                    ? state.sites.map((s) => (s.id === siteId ? site : s))
                    : [...state.sites, site];
                return {
                    sites,
                    sitesById: { ...state.sitesById, [siteId]: site },
                };
            });
            return site;
        } catch (error) {
            set({ error: getRequestErrorMessage(error, "Не удалось загрузить сайт") });
            throw error;
        }
    },

    fetchPages: async (siteId) => {
        if (get().pagesBySite[siteId]) {
            return get().pagesBySite[siteId];
        }

        set((state) => ({
            pagesLoading: { ...state.pagesLoading, [siteId]: true },
            error: undefined,
        }));

        try {
            const pages = await SitesApi.getPages(siteId);
            set((state) => ({
                pagesBySite: { ...state.pagesBySite, [siteId]: pages },
                pagesLoading: { ...state.pagesLoading, [siteId]: false },
            }));
            return pages;
        } catch (error) {
            set((state) => ({
                error: getRequestErrorMessage(error, "Не удалось загрузить страницы"),
                pagesLoading: { ...state.pagesLoading, [siteId]: false },
            }));
            throw error;
        }
    },

    fetchPageDetail: async (siteId, pageId) => {
        const key = buildPageKey(siteId, pageId);
        if (get().pageDetails[key]) {
            return get().pageDetails[key];
        }

        set((state) => ({
            pageDetailsLoading: { ...state.pageDetailsLoading, [key]: true },
            error: undefined,
        }));

        try {
            const page = await PagesApi.get(siteId, pageId);
            set((state) => ({
                pageDetails: { ...state.pageDetails, [key]: page },
                pageDetailsLoading: { ...state.pageDetailsLoading, [key]: false },
            }));
            return page;
        } catch (error) {
            set((state) => ({
                error: getRequestErrorMessage(error, "Не удалось загрузить страницу"),
                pageDetailsLoading: { ...state.pageDetailsLoading, [key]: false },
            }));
            throw error;
        }
    },
}));
