# Touchbell
A webapp that can be used as a notification system. Build to be used on a tablet at an entrance.

# Setup local enviroment
* install rails and mysql
* copy `/config/database.example.yml` to `/config/database.yml` and change credentials if necessary
* bundle install
* rails db:setup
* rails server
* visit http://localhost:3000

# How to use
Register a User. A admin user needs to approve a newly added bell. The bell will appear on the start screen.

# Bell trigger
The Touchbell only represents one side of a normal door bell. The place where someone can trigger the bell.
To notify someone that should open the door a trigger url is used.
Examples for services that could be used:
* https://maker.ifttt.com -> allows you to use everything within the IFTTT enviroment (SMS, E-Mail, ...)
* https://www.mercuriusbot.io/ -> sends you a message in Telegram
* https://telegramiotbot.com -> sends you a message in Telegram
* got another good service? Tell me!

# Contribute
* Fork it ( http://github.com/moritzmair/touchbell/fork )
* Create your feature branch (git checkout -b my-new-feature)
* Commit your changes (git commit -am 'Add some feature')
* Push to the branch (git push origin my-new-feature)
* Create a new Pull Request

# Found a bug?
* please report bugs or problems here: https://github.com/moritzmair/touchbell/issues
