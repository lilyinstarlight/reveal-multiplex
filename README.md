reveal-multiplex
================

reveal-multiplex is a web application for generating token and id pairs for multiplex functionality of reveal.js. Much of the code is taken from the [multiplex plugin](https://github.com/hakimel/reveal.js/tree/master/plugin/multiplex) of reveal.js. It supports namespaced presentations in such a way that a single presentation can have a global master and automatically connect with the global master.

Usage
-----

Replace the `users` field in `creds.js` with authentication credentials for people who should generate tokens.
