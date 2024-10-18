---
title: "How to Run Multiple Dockerized Proxied SPDY'd and Pagespeedified Ghost Blogs with 4 Commands"
date: 2014-07-26T10:11:19-05:00
draft: false
tags: ['docker', 'ghost', 'pagespeed', 'spdy', 'cloudflare', 'proxy']
note: 'This article was written on a muuuuch older blog many moons ago and was rescued via the wayback machine and migrated to this blog. The original article at the wayback machine is linked at the bottom of this article.'
---

## First, the tl;dr version for folks who are familiar with Docker and Ghost:

_(for those who aren't as familiar, scroll past the break or click here, also a disclaimer: You won't be able to use SPDY out of the box as you'll still need to install a signed SSL cert)_

```bash
git clone https://github.com/sethbrasile/blog.git && cd blog
```

Now anything in the blog directory will end up overwriting it's match in the default Ghost installation.
- Change whatever you need to change in `config.js` and `blog/content/`.
- Edit `startBlog.sh` to include your URL in the `VIRTUAL_HOST` field.
- `PAGESPEED=1` in `startBlog.sh` enables google pagespeed with CoreFilters and a few others enabled.
- Then:
```bash
./startVol.sh
./startBlog.sh
./startProxy.sh
```

From this point, `blog/content/` acts as your persistent storage. Photos you upload and etc.. will be stored in this directory. Your db is stored in the `blogVol` container so docker inspect `blogVol` if you want to take a look at it. Please note that the volume container doesn't stay running and that is fine. It still works.

To start a second and etc.. blog, repeat the process, after having changed the `-name` field in `startBlog.sh` and `startVol.sh` as well as the `-p` and `--volumes-from` fields in `startBlog.sh`.

That's it!

Information on the docker images used can be found here:

- [Ghost Container](https://registry.hub.docker.com/u/dockerfile/ghost/)
- [My Proxy Container](https://hub.docker.com/r/sethbrasile/nginx-proxy-pagespeed)
- [Which is based on this](https://registry.hub.docker.com/u/combro2k/nginx-proxy-pagespeed/)
- [Which is based on this](https://registry.hub.docker.com/u/combro2k/nginx-proxy/)

_Note: You'll want to add your own SSL certs to /etc/nginx/ssl if you want to use SPDY. The image currently has unsigned, self-generated certs._

_Another note: When I update css or an hbs template, I restart the blog container to see the changes. For some reason, this requires restarting the proxy a couple times for the proxy container to start back up without errors. I haven't quite worked out why yet, and this a problem because we want zero downtime! Please leave me a comment if you figure it out!_

## In depth version for someone who's less familiar with Ghost and Docker:

### What does Docker do? What's its point?

First, we need to understand what Docker is. There's tons of info out there on internets, but I'll do my best to sum it up anyway, and I'll leave out the underlying technology stuff that you can probably read in 967 different places.

Let's pretend we're setting up a WordPress website. Docker allows you to set up that WordPress website once, then replicate it perfectly over and over again (including the database, web server, etc..) without ever having to touch a configuration file again. Your 'image' will run exactly the same, no matter what machine you're on.

It also saves you tons of time because both initial setup and operation/maintenance is QUICK.

If for some reason you have to 'reboot' your site, Docker has it down, then back up (serving your site) in about 3 seconds. If you have two sites running, and you need to restart your web server for some change to take effect, you can do so (remember, in 3 seconds) without interrupting your 2nd site.

Are you ready for the coolest part? Remember that initial setup I was talking about? You don't even have to do that. I'll show you what I mean:

Docker can search and download from the "Docker Hub Registry" which is a site with tonnns of preconfigured images that you can download and use to your heart's content. If you get the image from a reputable source (anyone can upload to the registry) you can bet that its server is configured better than you could have done. Running the hypothetical WordPress site is as simple as typing:

```bash
docker run -d -p 80 tutum/wordpress
```

(Don't worry, I'll explain this in greater detail later)

Bam! Give it a few to download, and you'll have a working WordPress installation.

Type `docker ps` to see important info (like what port its on) then go to `x.x.x.x:port` in a browser and you've got WordPress!

Every aspect of setting up a WordPress site on a server is taken care of for you.

I'm going to show you how to set up my containers from scratch. If you'd rather just type a few commands, and take advantage of the "it's taken care of" aspects of Docker, then install Docker and go read the beginning of this post. If you'd like to understand how this works, and be able to build your own custom images, read on!

**So let's get down to brass tacks**

I won't go into how to install Docker, as its been covered many times over. If you'd like my recommendation for getting started with Docker, go sign up on digitalocean, they have a prebuilt Docker 'droplet' (they have their own fancy word for 'server') that you can have running in under a minute for $5/month, no contract, billed at .7 cents per hour (that's around half a penny). I'll be writing a full review and walkthrough of their services in a future post, as well as an "absolute beginners guide" to running a few different services with them.

(If you're going to sign up for Digital Ocean anyway, clicking that link is a good way to thank me for this guide. If you click that link and sign up, I get some free server time :D)

Now, on your Docker enabled machine (which I will refer to from now on as 'your machine'), open up a terminal and type docker --version to make sure you've got docker installed and working.

Assuming that didn't return an error, we're going to go ahead and download the images we'll be working with. This is not necessary, as docker run dockerfile/ghost will automatically download the Ghost image. We're doing it so that once we're into this, we can stay focused instead of waiting around for a download to finish. The total size of the downloads will be around 2GB, so hopefully you've got a quick connection, or you're on a cloud provider. On my Digital Ocean machines, all three are done in about 2 minutes, on my home connection, roughly 1-2 hours depending on the weather. **I'm serious.**

```bash
docker pull dockerfile/ghost
docker pull stackbrew/busybox
docker pull sethbrasile/nginx-proxy-pagespeed
```

After the images are downloaded, go ahead and type docker images and you should see something that looks like this:

```bash
REPOSITORY                          TAG                 IMAGE ID            CREATED             VIRTUAL SIZE
sethbrasile/nginx-proxy-pagespeed   latest              1852d2d9310c        5 days ago          1.141 GB
stackbrew/busybox                   latest              a9eb17255234        8 weeks ago         2.433 MB
dockerfile/ghost                    latest              77f447f8ef74        10 weeks ago        775 MB
dockerfile/nodejs                   latest              1535da87b710        10 weeks ago        660.8 MB
```

You might notice that there is an image there that we didn't request. `dockerfile/nodejs`? Where did that come from?

See that `ghost` is 775MB and node is 660MB?

What do you think the total size of the two images is? 1435MB? Right?
Wrong.

`dockerfile/ghost` is actually a 115MB layer on top of the `dockerfile/nodejs` image. The total size of the images is 775MB. They are split up like that so that you can download or build multiple images based on the `dockerfile/nodejs` image, but your machine only has to download and store it once.

_Note: now that we're on to actually using the images, you'll see me use the word 'container' instead. An image is a static, stored, unused thing that you use to start a 'container'. A container is your application running, working and interacting._

Now we're going to create an 'override' directory.

(this can be any directory name you want, but for the rest of this guide, let's assume it's `~/blog`)

```bash
cd ~/
mkdir blog && cd blog
```

Anything in this directory will override it's corresponding file/directory in the Ghost container.

Take a look here to understand the file structure of Ghost.

The files/directories that we are most concerned with are:

1. `config.example.js` (which ends up renamed to config.js)
2. `content/themes/`
3. `content/images/`

First, we'll make an images folder where ghost will store all of our uploaded images.

```bash
mkdir content && mkdir content/images
```

Create a file called `config.js` in `blog/`, then go ahead and copy all the text from this link and paste it into the file you just created.

The stuff in this file are the configuration settings for Ghost. There are many settings in here, and you can screw around with them later. For now, I'm going to cover the important ones.

**All the changes we make will be under the 'production' section.**

Where it says:

```js
filename: path.join(__dirname, '/content/data/ghost.db')
```

Remove `/content` and change `ghost.db` to whatever you're calling your application. Here, I've changed it to `blog.db`:

```js
filename: path.join(__dirname, '/data/blog.db')
```

The reason we're doing this is because later you may have more than one Ghost site, and need to move all your containers somewhere else. It will be nice to know which database is which, just by looking at the file name.

Where it says:

```yml
host: '127.0.0.1',
```
Change it to:

```yml
host: '0.0.0.0',
```

This is because Docker refers to it's own IP address as `0.0.0.0` instead of `127.0.0.1`, which is default in most other situations.

If you want to implement a theme(s), feel free to download (using git clone or download a zip and unzip), then place in `blog/content/themes/`

For example:

```bash
mkdir content && mkdir content/themes && cd content/themes
git clone https://github.com/mronemous/ghost-theme-techno.git
```

**That's it for Ghost setup! On to actually starting up our containers!**

### The Volume Container

```bash
docker run -v /data -name blogVol stackbrew/busybox
```

This starts the volume container to hold our database. The `stackbrew/busybox` image is an extremely small linux container with close to nothing in it. The `-v /data` is us telling docker, "Hey Docker, when you make this container, make the folder called `/data` available to me, outside the container." The container starts up, then immediately shuts down.

Docker containers only run while there is an active process running inside the container. Since we didn't ask the container to do anything besides expose a folder, it says, "welp, looks like I'm not needed anymore" and it shuts down.

**Is this a problem?**

No! A volume-only container doesn't have to be 'running', it only has to exist.

`-name blogVol` just asks Docker to name the container "blogVol"

#### Backing up your volume

At any time, `docker inspect blogVol` will give you the location of the volume on your machine, so you can back it up to your heart's content!

You can also `docker commit blogVol yourName/blogVol` to commit the container in it's current state to an image. You can then "push" that image to docker hub, or (preferably, since we're talking about a database) a private registry.

### The Proxy Container

We're using a proxy container so that you can run multiple sites on the same machine. The proxy container will automatically notice when you've started a new container that contains a web server, and start forwarding traffic to it. It also enables SSL, SPDY, and Google PageSpeed for every container that it forwards to.

(This next bit is all one line)

```bash
docker run -d -p 80:80 -p 443:443 -name proxy -v /var/run/docker.sock:/tmp/docker.sock -t sethbrasile/nginx-proxy-pagespeed forego start -r
```

`-d` is asking Docker to run this container as a 'daemon' (a background process). It basically means, "go ahead and start this container in the background. I'd like it to run, but I don't need to interact with it."

Before I explain what `-p 80:80 -p 443:443` means, you need to understand something about Docker containers. In certain ways, a docker container acts similarly to a virtual machine (like Virtual Box or VMware). One of the ways that it's similar to a VM is that it has it's own set of ports. Your machine has ports that it uses to communicate with the outside world. A Docker container has ports that is uses to communicate with your machine.

`-p 80:80 -p 443:443` asks Docker to open up port 80 (the standard internet port) and port 443 (the standard SSL port) inside the proxy container, then route those ports to port 80 and port 443 on your machine.

`-v /var/run/docker.sock:/tmp/docker.sock` has to do with unix sockets and I don't understand very well myself. I just know the original image author had that in his run command, so I stuck with it and it seems to work. I assume the auto-discovery scripts he wrote listen to that socket to find out which containers Docker has running.

`forego start -r` is just calling a script once the container starts. Any command you place directly after the name of the image ends up called in the container upon startup.

### The Ghost Container

(Again, one line)

```bash
docker run -e PAGESPEED=1 -e VIRTUAL_HOST=www.example.com --volumes-from blogVol -name blog -d -p 49154:2368 -v ~/blog:/ghost-override dockerfile/ghost
```

`-e PAGESPEED=1` and `-e VIRTUAL_HOST=www.example.com` are called environment variables and they are specifically needed for the proxy container. There are scripts running inside the proxy container that are looking for the values of these variables, and are ready to change their behavior based on their value.

`-p 49154:2368` asks Docker to route port `49154` on your machine to the container's port `2368`. Port `2368` is just the port specified for Ghost to use in `config.js`. This should stay the same on each Ghost container you start.

There is nothing special about port `49154`, it could be any port your wanted. Stick to a high number (to avoid conflicts), and make sure it's different each time if you start more Ghost containers.

By setting `PAGESPEED` to `1`, we're telling the the proxy scripts to activate google's PageSpeed service.

By setting `VIRTUAL_HOST` to `www.example.com`, the proxy container knows which traffic to send here. Now you can log in to your domain name provider, tell it to send traffic for `www.example.com` to the IP address of your machine. The proxy container will automatically send the traffic to the right place.

`--volumes-from blogVol` tells Docker to mount the previously created volume container's `/data` directory at this container's `/data` directory. Since we specified in `config.js` that it should save it's database at `/data/blog.db`, we now have Ghost saving it's database inside the volume container! You can now destroy, recreate, update, and edit your Ghost container as often as you'd like, and your site's database will stay intact!

`-v ~/blog:/ghost-override` tells the ghost container to mount your machine's `~/blog` directory in the container's `/ghost-override` directory. The container has been set up to automatically use any files present in the override directory instead of the correspondings file in the Ghost directory, so you can use this directory to edit/override any file that Ghost uses (if you're familiar with child-themes in wordpress, this works very similarly.

### All Done!

At this point, you should have your Ghost site running!

If you change something in the `~/blog` directory:

```basH
docker restart blog
docker restart proxy
docker restart proxy
```

For the change to take effect.

(I haven't quite pinned down why I need to restart the proxy twice for it to work, if you find that this isn't the case for you, please let me know in the comments so I can fix this!)

If you made it through all of that, good job! Leave me a comment if you have any questions!

This article was rescued via the wayback machine:

https://web.archive.org/web/20150220031625/http://sethbrasile.geekedout.biz/how-to-run-multiple-dockerized-proxied-spdyd-and-pagespeedified-ghost-blogs-with-4-commands/
