package main

import (
	"appengine"
	"fmt"
	"net/http"
	"strconv"
)

func init() {
	http.HandleFunc("/", redirect)
	http.HandleFunc("/latency", latency)
	http.HandleFunc("/download", download)
	http.HandleFunc("/upload", upload)
}

func redirect(w http.ResponseWriter, r *http.Request) {
	http.Redirect(w, r, "/html/index.html", http.StatusFound)
}

func latency(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Cache-Control", "no-cache, no-store, must-revalidate") // HTTP 1.1.
	w.Header().Set("Pragma", "no-cache") // HTTP 1.0.
	w.Header().Set("Expires", "0") // Proxies.
	fmt.Fprintf(w, "ok")
}

func download(w http.ResponseWriter, r *http.Request) {
	c := appengine.NewContext(r)

	w.Header().Set("Cache-Control", "no-cache, no-store, must-revalidate") // HTTP 1.1.
	w.Header().Set("Pragma", "no-cache") // HTTP 1.0.
	w.Header().Set("Expires", "0") // Proxies.

	sizeString := r.PostFormValue("size")
	if sizeString == "" {
		fmt.Fprintf(w, "size not supplied")
		c.Infof("size not supplied")
		return
	}

	size, err := strconv.ParseFloat(sizeString, 64)
	if err != nil {
		fmt.Fprintf(w, "could not parse size")
		c.Infof("could not parse size")
		return
	}
	if size > 20 {
		fmt.Fprintf(w, "download request too large")
		c.Infof("download request too large")
		return
	}
	
	downloading := make([]byte, int64(size * 1048576))
	w.Write(downloading)
	c.Infof("InfoLength: %v", len(downloading))
}

func upload(w http.ResponseWriter, r *http.Request) {
	c := appengine.NewContext(r)

	w.Header().Set("Cache-Control", "no-cache, no-store, must-revalidate") // HTTP 1.1.
	w.Header().Set("Pragma", "no-cache") // HTTP 1.0.
	w.Header().Set("Expires", "0") // Proxies.

	uploaded := r.FormValue("upload")

	c.Infof("InfoLength: %v", len(uploaded))

	fmt.Fprintf(w, "ok: %d", len([]byte(uploaded)) / 1048576)
}