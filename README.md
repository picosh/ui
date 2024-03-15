This is an experimental web-based UI leveraging [web tunnels](https://pico.sh/tunnels).

To use the web UI, create an SSH local forward connection to our
[pgs](https://pico.sh/pgs)
site:

```bash
ssh -L 1337:localhost:80 -N pico-ui@pgs.sh
```

Then open your browser and navigate to [localhost:1337](http://localhost:1337).

# imgs

If you want to view your docker repositories on [imgs.sh](https://pico/imgs)
then you need to open an additional SSH tunnel:

```bash
ssh -L 1338:localhost:80 -N imgs.sh
```
