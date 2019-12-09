# frozen_string_literal: true

source 'https://rubygems.org'

git_source(:github) do |repo_name|
  repo_name = "#{repo_name}/#{repo_name}" unless repo_name.include?('/')
  "https://github.com/#{repo_name}.git"
end

ruby '2.6.1'

gem 'bootstrap', '>= 4.1.2'
gem 'devise'
gem 'font-awesome-rails'
gem 'jquery-rails'
gem 'mysql2'
gem 'pg'
gem 'puma', '~> 3.12'
gem 'rails', '~> 5.1.1'
gem 'rails_admin', '~> 1.3'
gem 'sass-rails', '~> 5.0'
gem 'turbolinks', '~> 5'
gem 'uglifier', '>= 1.3.0'
gem 'uploadcare-rails', '~> 1.1'

group :development, :test do
  gem 'capybara', '~> 2.13'
  gem 'pry'
  gem 'selenium-webdriver'
end

group :development do
  gem 'capistrano-rails'
  gem 'listen', '>= 3.0.5', '< 3.2'
  gem 'rubocop', require: false
  gem 'spring'
  gem 'spring-watcher-listen', '~> 2.0.0'
end

# Windows does not include zoneinfo files, so bundle the tzinfo-data gem
gem 'tzinfo-data', platforms: %i[mingw mswin x64_mingw jruby]
