# frozen_string_literal: true

Rails.application.routes.draw do
  devise_for :users
  mount RailsAdmin::Engine => '/admin', as: 'rails_admin'
  resources :bells
  get '/ringring/:id' => 'bells#ringring'
  root to: 'welcome#home'
end

#create new route, create uri(unique route identification)
# write in words --> whatever they have/create bell/new bell
# create uri then call it from UI
#data structure also - not so and in UI -> when that matches it can call --> call in postman


