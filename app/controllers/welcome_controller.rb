class WelcomeController < ApplicationController
  def home
    @bells = Bell.all
    render layout: 'home'
  end
end
