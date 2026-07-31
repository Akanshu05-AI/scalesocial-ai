"use client";

/**
 * Holds the Facebook user access token + selected page in localStorage
 * since the backend never persists them (see api.ts). This is
 * necessarily client-held, session-like state, not a real "connected
 * accounts" record — closer to how the pre-OAuth-abstraction web looked
 * than to Twitter's account model in this same backend.
 */
import { useState, useEffect } from "react";
import type { FacebookPage } from "../types";

const TOKEN_KEY = "social-suite:facebook-access-token";
const PAGE_KEY = "social-suite:facebook-selected-page";

export function useFacebookSession() {
  const [accessToken, setAccessTokenState] = useState<string | null>(null);
  const [selectedPage, setSelectedPageState] = useState<FacebookPage | null>(null);

  useEffect(() => {
    setAccessTokenState(window.localStorage.getItem(TOKEN_KEY));
    const storedPage = window.localStorage.getItem(PAGE_KEY);
    if (storedPage) setSelectedPageState(JSON.parse(storedPage));
  }, []);

  function setAccessToken(token: string) {
    setAccessTokenState(token);
    window.localStorage.setItem(TOKEN_KEY, token);
  }

  function setSelectedPage(page: FacebookPage) {
    setSelectedPageState(page);
    window.localStorage.setItem(PAGE_KEY, JSON.stringify(page));
  }

  function clear() {
    setAccessTokenState(null);
    setSelectedPageState(null);
    window.localStorage.removeItem(TOKEN_KEY);
    window.localStorage.removeItem(PAGE_KEY);
  }

  return { accessToken, setAccessToken, selectedPage, setSelectedPage, clear };
}
