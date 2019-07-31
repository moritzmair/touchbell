# frozen_string_literal: true

class User < ApplicationRecord
  extend Devise::Models
  has_many :bells

  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :trackable

  # Provided for Rails Admin to allow the password to be reset
  def set_password
    nil
  end

  def set_password=(value)
    return nil if value.blank?

    self.password = value
    self.password_confirmation = value
    save
  end
end
