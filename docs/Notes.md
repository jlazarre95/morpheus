# Run simulation and generate script
morpheus run login.blueprint.yml -a url=http://localhost:8080 -p calendar -s loadrunner

morpheus run login.blueprint.yml -a url=http://localhost:8080 -p calendar -o tmp -s loadrunner

# ? 
morpheus run login.blueprint.yml -a url=http://localhost:8080 -a username=papaj -a password=password -f Users:Calendar -o tmp -s loadrunner --plugin lre-upload -a lre-host=http://d13dlreap01.dev.us.corp -a lre-aomain=DELTAFORCE -a lre-project=JSIM

# Run simulation
morpheus simulate login.blueprint.yml -a url=http://localhost:8080 -a username=papaj -a password=password -o tmp/simulation

# Generate script
morpheus script login.blueprint.yml -i login.har -o tmp/script -s loadrunner

# Run LRE upload script plugin?
morpheus run-plugin lre --command upload-script --script-air tmp/login --host=http://d13dlreap01.dev.us.corp --domain=DELTAFORCE --project=JSIM

# Git repo structure
ukgpro/actions/hit-server.action.yml
ukgpro/actions/login.action.yml
ukgpro/actions/logout.action.yml

ukgpro/blueprints/change-job.blueprint.yml
ukgpro/blueprints/view-pay.blueprint.yml

ukgpro/correlations/xsrf-token.correlation.yml

ukgpro/files/Calendar_Users.dat
ukgpro/files/GSDB_Users.dat
ukgpro/files/ServiceB_Users.dat

ukgpro/logic/polling.logic.yml